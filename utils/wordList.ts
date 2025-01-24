// This is a simplified version of the word list. In a real application, you'd want to use the full list from the attachment.
export const wordList = [
  "Harry Potter",
  "Hogwarts",
  "Gryffindor",
  "Hermione Granger",
  "Ron Weasley",
  "Voldemort",
  "Dumbledore",
  "Quidditch",
  "Muggle",
  "Wand",
  "Spell",
  "Potion",
  "Wizard",
  "Witch",
  "Patronus",
  "Dementor",
  "Horcrux",
  "Snape",
  "Hagrid",
  "Sirius Black",
]

export function getRandomWord(): string {
  return wordList[Math.floor(Math.random() * wordList.length)]
}

