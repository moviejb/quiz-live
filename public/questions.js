const QUESTIONS = [
 {
  id: 0,
  disciplina: 'Geografia',
  argomento: 'Puzzle foto',
  type: 'image-order',
  question: 'Guarda l’immagine sullo schermo e rimetti in ordine i pezzi sul telefono.',
  questionImage: 'img/quiz/geografia/bruxelles.jpg',
  questionImageAlt: 'Panorama di Bruxelles',
  rows: 2,
  cols: 2,
  time: 25,
  points: 150,
  explain: 'L’ordine corretto ricomponeva la foto di Bruxelles.'
}, {
    id: 1,
    disciplina: 'Geografia',
    argomento: 'Capitali europee',
    type: 'multiple',
    question: 'Qual è la capitale del Belgio?',
    questionImage: 'img/quiz/geografia/bruxelles.jpg',
    questionImageAlt: 'Panorama di Bruxelles',
    options: [
      { text: 'Bruxelles', image: 'img/quiz/geografia/bruxelles.jpg' },
      { text: 'Parigi', image: 'img/quiz/geografia/parigi.jpg' },
      { text: 'Amsterdam', image: 'img/quiz/geografia/amsterdam.jpg' },
      { text: 'Vienna', image: 'img/quiz/geografia/vienna.jpg' }
    ],
    correctIndex: 0,
    time: 15,
    points: 100,
    explain: 'Bruxelles è la capitale del Belgio.'
  },
  {
  id: 2,
  disciplina: 'Geografia',
  argomento: 'Monumenti',
  type: 'image-pieces',
  question: 'Che luogo è questo?',
  questionImage: 'img/quiz/geografia/bruxelles.jpg',
  options: [
    'Bruxelles',
    'Parigi',
    'Amsterdam',
    'Vienna'
  ],
  correctIndex: 0,
  time: 20,
  points: 120,
  revealSteps: 8,
  explain: 'L’immagine mostrava Bruxelles.'
},
   {
    id: 3,
    disciplina: 'Geografia',
    argomento: 'Capitali europee',
    type: 'multiple',
    question: 'Qual è la capitale del Belgio?',
    questionImage: 'img/quiz/geografia/bruxelles.jpg',
    questionImageAlt: 'Panorama di Bruxelles',
    options: [
      { text: '', image: 'img/quiz/geografia/bruxelles.jpg' },
      { text: '', image: 'img/quiz/geografia/parigi.jpg' },
      { text: '', image: 'img/quiz/geografia/amsterdam.jpg' },
      { text: '', image: 'img/quiz/geografia/vienna.jpg' }
    ],
    correctIndex: 0,
    time: 15,
    points: 100,
    explain: 'Bruxelles è la capitale del Belgio.'
  },
  {
    id: 4,
    disciplina: 'Scienze',
    argomento: 'Animali',
    type: 'truefalse',
    question: 'L’animale in foto è un mammifero.',
    questionImage: 'img/quiz/scienze/pipistrello.jpg',
    questionImageAlt: 'Pipistrello appeso',
    correctAnswer: true,
    time: 10,
    points: 100,
    explain: 'Il pipistrello è un mammifero.'
  },
  {
    id: 5,
    disciplina: 'Italiano',
    argomento: 'Vocabolario',
    type: 'text',
    question: 'Scrivi il nome di ciò che vedi.',
    questionImage: 'img/quiz/italiano/ciliegie.jpg',
    questionImageAlt: 'Un grappolo di ciliegie',
    correctAnswers: ['ciliegie'],
    time: 20,
    points: 120,
    explain: "La risposta corretta è 'ciliegie'."
  },
  {
    id: 6,
    disciplina: 'Storia',
    argomento: 'Cronologia',
    type: 'order',
    question: 'Metti in ordine cronologico dal più antico al più recente.',
    questionImage: 'img/quiz/storia/linea_del_tempo.jpg',
    items: [
      { id: 'mod', text: 'Età moderna', image: 'img/quiz/storia/eta_moderna.jpg' },
      { id: 'pre', text: 'Preistoria', image: 'img/quiz/storia/preistoria.jpg' },
      { id: 'med', text: 'Medioevo', image: 'img/quiz/storia/medioevo.jpg' }
    ],
    correctOrder: ['pre', 'med', 'mod'],
    time: 25,
    points: 150,
    explain: 'L’ordine corretto è Preistoria → Medioevo → Età moderna.'
  },
  {
    id: 7,
    disciplina: 'Scienze',
    argomento: 'Animali',
    type: 'multiple',
    question: 'Quale immagine mostra un mammifero marino?',
    options: [
      { text: 'Delfino', image: 'img/quiz/scienze/delfino.jpg' },
      { text: 'Squalo', image: 'img/quiz/scienze/squalo.jpg' },
      { text: 'Polpo', image: 'img/quiz/scienze/polpo.jpg' },
      { text: 'Trota', image: 'img/quiz/scienze/trota.jpg' }
    ],
    correctIndex: 0,
    time: 15,
    points: 100
  }
];

if (typeof window !== 'undefined') {
  window.QUESTIONS = QUESTIONS;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = QUESTIONS;
}
