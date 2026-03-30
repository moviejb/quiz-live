const QUESTIONS = [
  {
    id: 1,
    disciplina: 'Geografia',
    argomento: 'Capitali europee',
    type: 'multiple',
    question: 'Capitale del Belgio?',
    options: ['Bruxelles', 'Parigi', 'Amsterdam', 'Vienna'],
    correctIndex: 0,
    time: 15,
    points: 100,
    explain: 'Bruxelles è la capitale del Belgio.'
  },
  {
    id: 2,
    disciplina: 'Scienze',
    argomento: 'Animali',
    type: 'truefalse',
    question: 'Il pipistrello è un mammifero.',
    correctAnswer: true,
    time: 10,
    points: 100,
    explain: 'Il pipistrello è un mammifero, non un uccello.'
  },
  {
    id: 3,
    disciplina: 'Italiano',
    argomento: 'Ortografia',
    type: 'text',
    question: "Scrivi il plurale corretto di 'ciliegia'.",
    correctAnswers: ['ciliegie'],
    time: 20,
    points: 120,
    explain: "Il plurale corretto è 'ciliegie'."
  },
  {
    id: 4,
    disciplina: 'Storia',
    argomento: 'Cronologia',
    type: 'order',
    question: 'Metti in ordine cronologico dal più antico al più recente.',
    items: ['Età moderna', 'Preistoria', 'Medioevo'],
    correctOrder: ['Preistoria', 'Medioevo', 'Età moderna'],
    time: 25,
    points: 150,
    explain: 'L’ordine corretto è Preistoria → Medioevo → Età moderna.'
  }
];

if (typeof window !== 'undefined') {
  window.QUESTIONS = QUESTIONS;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = QUESTIONS;
}
