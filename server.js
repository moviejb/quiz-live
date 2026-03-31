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

const DISPLAY_MODES = new Set([
  'host-only',
  'host-and-player',
  'player-only'
]);

function generateRoomCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';

  do {
    code = Array.from({ length }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
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

function normalizeOrderValue(value) {
  if (value && typeof value === 'object') {
    return String(
      value.id ??
      value.value ??
      value.text ??
      ''
    );
  }
  return String(value ?? '');
}

/* =========================
   SCORE RISPOSTA
========================= */

function scoreAnswer(question, answer, elapsedMs) {

  const maxPoints = question.points || 100;
  const timeMs = (question.time || 20) * 1000;

  const safeElapsed =
    Math.max(0, Math.min(elapsedMs, timeMs));

  const speedBonus =
    Math.round(
      maxPoints * 0.5 *
      (1 - safeElapsed / timeMs)
    );

  let correct = false;

  /* MULTIPLE */

  if (
    question.type === 'multiple' ||
    question.type === 'image-pieces'
  ) {

    correct =
      Number(answer.selectedIndex)
      ===
      Number(question.correctIndex);

  }

  /* TRUE FALSE */

  else if (
    question.type === 'truefalse'
  ) {

    correct =
      Boolean(answer.value)
      ===
      Boolean(question.correctAnswer);

  }

  /* TEXT */

  else if (
    question.type === 'text'
  ) {

    const allowed =
      (question.correctAnswers || [])
        .map(normalizeText);

    correct =
      allowed.includes(
        normalizeText(answer.text)
      );

  }

  /* ORDER */

  else if (
    question.type === 'order'
  ) {

    const sent =
      (Array.isArray(answer.order)
        ? answer.order
        : []
      ).map(normalizeOrderValue);

    const expected =
      (question.correctOrder || [])
        .map(normalizeOrderValue);

    correct =
      JSON.stringify(sent)
      ===
      JSON.stringify(expected);

  }

  /* IMAGE ORDER  ⭐⭐⭐ */

  else if (
    question.type === 'image-order'
  ) {

    const rows =
      Math.max(
        1,
        Number(question.rows) || 2
      );

    const cols =
      Math.max(
        1,
        Number(question.cols) || 2
      );

    const total = rows * cols;

    const expected =
      Array.from(
        { length: total },
        (_, i) => `p${i}`
      );

    const sent =
      (Array.isArray(answer.order)
        ? answer.order
        : []
      ).map(String);

    correct =
      JSON.stringify(sent)
      ===
      JSON.stringify(expected);

  }

  return {

    correct,

    earned:
      correct
        ? maxPoints + speedBonus
        : 0,

    speedBonus:
      correct
        ? speedBonus
        : 0

  };

}

/* =========================
   QR
========================= */

app.get('/api/qr', async (req, res) => {

  try {

    const target =
      String(req.query.url || '').trim();

    if (!target) {
      res.status(400).send('Missing url');
      return;
    }

    const png =
      await QRCode.toBuffer(target, {
        type: 'png',
        width: 320,
        margin: 1
      });

    res.setHeader(
      'Content-Type',
      'image/png'
    );

    res.send(png);

  }

  catch (error) {

    res
      .status(500)
      .send('QR generation failed');

  }

});

/* =========================
   SOCKET
========================= */

io.on('connection', (socket) => {

  socket.on(
    'host:createRoom',
    (
      {
        title,
        questions,
        displayMode
      } = {},
      callback = () => {}
    ) => {

      try {

        const roomCode =
          generateRoomCode();

        if (
          !Array.isArray(questions) ||
          !questions.length
        ) {

          callback({
            ok: false,
            error:
              'Nessuna domanda disponibile.'
          });

          return;

        }

        const safeDisplayMode =
          DISPLAY_MODES.has(displayMode)
            ? displayMode
            : 'host-only';

        rooms.set(roomCode, {

          code: roomCode,

          title:
            title || 'Quiz Live',

          hostId: socket.id,

          players: [],

          questions,

          questionIndex: -1,

          status: 'lobby',

          displayMode: safeDisplayMode,

          timer: null,

          currentAnswers: {},

          reveal: null,

          questionStartedAt: null

        });

        socket.join(`host:${roomCode}`);

        callback({

          ok: true,

          roomCode,

          displayMode: safeDisplayMode

        });

      }

      catch {

        callback({

          ok: false,

          error:
            'Errore nella creazione stanza.'

        });

      }

    }

  );

});

/* =========================
   START SERVER
========================= */

server.listen(PORT, () => {

  console.log(
    `Server avviato su porta ${PORT}`
  );

});