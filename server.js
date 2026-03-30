const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const QRCode = require('qrcode');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const rooms = new Map();
const DISPLAY_MODES = new Set(['host-only', 'host-and-player', 'player-only']);

function generateRoomCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  do {
    code = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function normalizeText(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function getOptionPayload(option, index = 0) {
  if (option && typeof option === 'object' && !Array.isArray(option)) {
    return {
      id: option.id ?? `opt-${index}`,
      text: option.text ?? option.label ?? '',
      image: option.image || option.img || '',
      alt: option.alt || option.text || option.label || `Opzione ${index + 1}`
    };
  }
  return {
    id: `opt-${index}`,
    text: String(option ?? ''),
    image: '',
    alt: String(option ?? '') || `Opzione ${index + 1}`
  };
}

function getOrderItemPayload(item, index = 0) {
  if (item && typeof item === 'object' && !Array.isArray(item)) {
    return {
      id: String(item.id ?? item.value ?? item.text ?? `item-${index}`),
      text: item.text ?? item.label ?? '',
      image: item.image || item.img || '',
      alt: item.alt || item.text || item.label || `Elemento ${index + 1}`
    };
  }
  return {
    id: String(item ?? `item-${index}`),
    text: String(item ?? ''),
    image: '',
    alt: String(item ?? '') || `Elemento ${index + 1}`
  };
}

function normalizeOrderValue(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return String(value.id ?? value.value ?? value.text ?? '');
  }
  return String(value ?? '');
}

function sanitizeQuestion(question, index, total, displayMode = 'host-and-player') {
  if (!question) return null;

  const options = Array.isArray(question.options) ? question.options.map((opt, idx) => getOptionPayload(opt, idx)) : [];
  const items = Array.isArray(question.items) ? question.items.map((item, idx) => getOrderItemPayload(item, idx)) : [];

  const base = {
    id: question.id,
    disciplina: question.disciplina || '',
    argomento: question.argomento || '',
    type: question.type,
    question: question.question,
    questionImage: question.questionImage || question.image || '',
    questionImageAlt: question.questionImageAlt || question.imageAlt || question.question || 'Immagine domanda',
    options,
    optionCount: options.length,
    items,
    time: question.time || 20,
    points: question.points || 100,
    index: index + 1,
    total,
    displayMode
  };

  if (displayMode === 'host-only') {
    return {
      ...base,
      question: '',
      questionImage: '',
      questionImageAlt: '',
      disciplina: '',
      argomento: ''
    };
  }

  return base;
}

function getPublicPlayers(room) {
  return room.players.map((p) => ({
    id: p.id,
    name: p.name,
    score: p.score,
    connected: p.connected,
    answered: !!room.currentAnswers[p.id]
  }));
}

function getRanking(room) {
  return [...room.players]
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      connected: p.connected
    }));
}

function roomStateForHost(code) {
  const room = rooms.get(code);
  if (!room) return null;
  return {
    code,
    status: room.status,
    displayMode: room.displayMode,
    questionIndex: room.questionIndex,
    currentQuestion: sanitizeQuestion(
      room.questions[room.questionIndex],
      room.questionIndex,
      room.questions.length,
      'host-and-player'
    ),
    players: getPublicPlayers(room),
    ranking: getRanking(room),
    answersCount: Object.keys(room.currentAnswers).length,
    totalQuestions: room.questions.length,
    reveal: room.reveal || null,
    roomTitle: room.title || 'Quiz Live'
  };
}

function roomStateForPlayers(code) {
  const room = rooms.get(code);
  if (!room) return null;
  return {
    code,
    status: room.status,
    displayMode: room.displayMode,
    players: getPublicPlayers(room),
    ranking: getRanking(room),
    answersCount: Object.keys(room.currentAnswers).length,
    totalQuestions: room.questions.length,
    roomTitle: room.title || 'Quiz Live'
  };
}

function emitRoomState(code) {
  const hostState = roomStateForHost(code);
  const playerState = roomStateForPlayers(code);
  if (!hostState || !playerState) return;
  io.to(`host:${code}`).emit('hostState', hostState);
  io.to(`room:${code}`).emit('roomState', playerState);
}

function scoreAnswer(question, answer, elapsedMs) {
  const maxPoints = question.points || 100;
  const timeMs = (question.time || 20) * 1000;
  const safeElapsed = Math.max(0, Math.min(elapsedMs, timeMs));
  const speedBonus = Math.round(maxPoints * 0.5 * (1 - safeElapsed / timeMs));
  let correct = false;

  if (question.type === 'multiple') {
    correct = Number(answer.selectedIndex) === Number(question.correctIndex);
  } else if (question.type === 'truefalse') {
    correct = Boolean(answer.value) === Boolean(question.correctAnswer);
  } else if (question.type === 'text') {
    const allowed = (question.correctAnswers || []).map(normalizeText);
    correct = allowed.includes(normalizeText(answer.text));
  } else if (question.type === 'order') {
    const sent = (Array.isArray(answer.order) ? answer.order : []).map(normalizeOrderValue);
    const expected = (question.correctOrder || []).map(normalizeOrderValue);
    correct = JSON.stringify(sent) === JSON.stringify(expected);
  }

  return {
    correct,
    earned: correct ? maxPoints + speedBonus : 0,
    speedBonus: correct ? speedBonus : 0
  };
}

function endQuestion(code) {
  const room = rooms.get(code);
  if (!room || room.status !== 'question') return;

  clearTimeout(room.timer);
  room.timer = null;
  room.status = 'reveal';

  const question = room.questions[room.questionIndex];
  const answers = Object.values(room.currentAnswers);
  const results = answers.map((entry) => {
    const player = room.players.find((p) => p.id === entry.playerId);
    const scored = scoreAnswer(question, entry.answer, entry.elapsedMs);
    if (player) player.score += scored.earned;
    return {
      playerId: entry.playerId,
      name: player ? player.name : 'Giocatore',
      ...scored,
      answer: entry.answer
    };
  });

  room.reveal = {
    questionId: question.id,
    type: question.type,
    explain: question.explain || '',
    questionImage: question.questionImage || question.image || '',
    questionImageAlt: question.questionImageAlt || question.imageAlt || question.question || 'Immagine domanda',
    options: Array.isArray(question.options) ? question.options.map((opt, idx) => getOptionPayload(opt, idx)) : [],
    items: Array.isArray(question.items) ? question.items.map((item, idx) => getOrderItemPayload(item, idx)) : [],
    correctIndex: question.correctIndex,
    correctAnswer: question.correctAnswer,
    correctAnswers: question.correctAnswers || [],
    correctOrder: (question.correctOrder || []).map(normalizeOrderValue),
    results
  };

  emitRoomState(code);
  io.to(`room:${code}`).emit('questionEnded', room.reveal);
  io.to(`host:${code}`).emit('questionEnded', room.reveal);
}

function startQuestion(code) {
  const room = rooms.get(code);
  if (!room) return;

  const question = room.questions[room.questionIndex];
  if (!question) {
    room.status = 'finished';
    room.reveal = null;
    clearTimeout(room.timer);
    room.timer = null;
    emitRoomState(code);
    io.to(`room:${code}`).emit('quizFinished');
    io.to(`host:${code}`).emit('quizFinished');
    return;
  }

  room.status = 'question';
  room.currentAnswers = {};
  room.reveal = null;
  room.questionStartedAt = Date.now();

  clearTimeout(room.timer);
  room.timer = setTimeout(() => endQuestion(code), (question.time || 20) * 1000);

  emitRoomState(code);

  io.to(`host:${code}`).emit(
    'questionStarted',
    sanitizeQuestion(question, room.questionIndex, room.questions.length, 'host-and-player')
  );

  io.to(`room:${code}`).emit(
    'questionStarted',
    sanitizeQuestion(question, room.questionIndex, room.questions.length, room.displayMode)
  );
}

app.get('/api/qr', async (req, res) => {
  try {
    const target = String(req.query.url || '').trim();
    if (!target) {
      res.status(400).send('Missing url');
      return;
    }
    const png = await QRCode.toBuffer(target, {
      type: 'png',
      width: 320,
      margin: 1,
      color: {
        dark: '#111827',
        light: '#FFFFFFFF'
      }
    });
    res.setHeader('Content-Type', 'image/png');
    res.send(png);
  } catch (error) {
    res.status(500).send('QR generation failed');
  }
});

io.on('connection', (socket) => {
  socket.on('host:createRoom', ({ title, questions, displayMode } = {}, callback = () => {}) => {
    try {
      const roomCode = generateRoomCode();
      const normalizedQuestions = Array.isArray(questions) ? questions : [];
      if (!normalizedQuestions.length) {
        callback({ ok: false, error: 'Nessuna domanda disponibile.' });
        return;
      }

      const safeDisplayMode = DISPLAY_MODES.has(displayMode) ? displayMode : 'host-only';

      rooms.set(roomCode, {
        code: roomCode,
        title: title || 'Quiz Live',
        hostId: socket.id,
        players: [],
        questions: normalizedQuestions,
        questionIndex: -1,
        status: 'lobby',
        displayMode: safeDisplayMode,
        timer: null,
        currentAnswers: {},
        reveal: null,
        questionStartedAt: null
      });

      socket.data.roomCode = roomCode;
      socket.data.role = 'host';
      socket.join(`host:${roomCode}`);
      callback({ ok: true, roomCode, displayMode: safeDisplayMode });
      emitRoomState(roomCode);
    } catch (error) {
      callback({ ok: false, error: 'Errore nella creazione della stanza.' });
    }
  });

  socket.on('host:joinRoom', ({ roomCode } = {}, callback = () => {}) => {
    const room = rooms.get(String(roomCode || '').toUpperCase());
    if (!room) {
      callback({ ok: false, error: 'Stanza non trovata.' });
      return;
    }
    room.hostId = socket.id;
    socket.data.roomCode = room.code;
    socket.data.role = 'host';
    socket.join(`host:${room.code}`);
    callback({ ok: true, roomCode: room.code, displayMode: room.displayMode });
    emitRoomState(room.code);
  });

  socket.on('host:setDisplayMode', ({ roomCode, displayMode } = {}, callback = () => {}) => {
    const code = String(roomCode || '').toUpperCase();
    const room = rooms.get(code);
    if (!room || room.hostId !== socket.id) {
      callback({ ok: false, error: 'Host non autorizzato.' });
      return;
    }
    if (room.status !== 'lobby') {
      callback({ ok: false, error: 'Puoi cambiare modalità solo in lobby.' });
      return;
    }
    if (!DISPLAY_MODES.has(displayMode)) {
      callback({ ok: false, error: 'Modalità non valida.' });
      return;
    }
    room.displayMode = displayMode;
    emitRoomState(code);
    callback({ ok: true, displayMode });
  });

  socket.on('player:joinRoom', ({ roomCode, name } = {}, callback = () => {}) => {
    const code = String(roomCode || '').toUpperCase();
    const room = rooms.get(code);
    const cleanName = String(name || '').trim().slice(0, 20);

    if (!room) {
      callback({ ok: false, error: 'Stanza non trovata.' });
      return;
    }
    if (!cleanName) {
      callback({ ok: false, error: 'Inserisci un nome.' });
      return;
    }

    let existing = room.players.find(
      (p) => p.name.toLowerCase() === cleanName.toLowerCase() && !p.connected
    );

    if (existing) {
      existing.id = socket.id;
      existing.connected = true;
    } else {
      existing = { id: socket.id, name: cleanName, score: 0, connected: true };
      room.players.push(existing);
    }

    socket.data.roomCode = code;
    socket.data.role = 'player';
    socket.join(`room:${code}`);

    callback({
      ok: true,
      playerId: socket.id,
      roomCode: code,
      status: room.status,
      displayMode: room.displayMode,
      title: room.title
    });

    emitRoomState(code);

    if (room.status === 'question') {
      socket.emit(
        'questionStarted',
        sanitizeQuestion(room.questions[room.questionIndex], room.questionIndex, room.questions.length, room.displayMode)
      );
    }
  });

  socket.on('host:startQuiz', ({ roomCode } = {}, callback = () => {}) => {
    const code = String(roomCode || '').toUpperCase();
    const room = rooms.get(code);
    if (!room || room.hostId !== socket.id) {
      callback({ ok: false, error: 'Host non autorizzato.' });
      return;
    }
    room.questionIndex = 0;
    startQuestion(code);
    callback({ ok: true });
  });

  socket.on('host:nextQuestion', ({ roomCode } = {}, callback = () => {}) => {
    const code = String(roomCode || '').toUpperCase();
    const room = rooms.get(code);
    if (!room || room.hostId !== socket.id) {
      callback({ ok: false, error: 'Host non autorizzato.' });
      return;
    }

    if (room.status === 'question') endQuestion(code);
    room.questionIndex += 1;
    startQuestion(code);
    callback({ ok: true });
  });

  socket.on('host:endQuestion', ({ roomCode } = {}, callback = () => {}) => {
    const code = String(roomCode || '').toUpperCase();
    const room = rooms.get(code);
    if (!room || room.hostId !== socket.id) {
      callback({ ok: false, error: 'Host non autorizzato.' });
      return;
    }
    endQuestion(code);
    callback({ ok: true });
  });

  socket.on('player:submitAnswer', ({ roomCode, answer } = {}, callback = () => {}) => {
    const code = String(roomCode || '').toUpperCase();
    const room = rooms.get(code);
    if (!room || room.status !== 'question') {
      callback({ ok: false, error: 'Nessuna domanda attiva.' });
      return;
    }
    if (room.currentAnswers[socket.id]) {
      callback({ ok: false, error: 'Hai già risposto.' });
      return;
    }

    room.currentAnswers[socket.id] = {
      playerId: socket.id,
      answer,
      elapsedMs: Date.now() - room.questionStartedAt
    };

    emitRoomState(code);
    callback({ ok: true });

    const connectedPlayers = room.players.filter((p) => p.connected).length;
    if (Object.keys(room.currentAnswers).length >= connectedPlayers) {
      endQuestion(code);
    }
  });

  socket.on('disconnect', () => {
    const code = socket.data.roomCode;
    if (!code) return;
    const room = rooms.get(code);
    if (!room) return;

    if (socket.data.role === 'player') {
      const player = room.players.find((p) => p.id === socket.id);
      if (player) player.connected = false;
    }

    if (room.hostId === socket.id) {
      room.hostId = null;
    }

    emitRoomState(code);
  });
});

server.listen(PORT, () => {
  console.log(`Quiz Live attivo su http://localhost:${PORT}`);
});
