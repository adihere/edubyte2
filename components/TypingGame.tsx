"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { getRandomWord } from "../utils/wordList"
import styles from "../styles/TypingGame.module.css"

// Game parameters
const MIN_START_TIME = 5
const MAX_START_TIME = 15
const WORD_FALL_INTERVAL = 50 // milliseconds
const WORD_CONTAINER_HEIGHT = 400 // pixels
const SCORE_CHANGE_DURATION = 1000 // milliseconds
const SANDBOX_FLIP_DURATION = 1000 // milliseconds

export default function TypingGame() {
  const [word, setWord] = useState("")
  const [input, setInput] = useState("")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [wordPosition, setWordPosition] = useState(0)
  const [scoreChange, setScoreChange] = useState(0)
  const [sandboxFlipped, setSandboxFlipped] = useState(false)

  const startSoundRef = useRef<HTMLAudioElement | null>(null)
  const gameOverSoundRef = useRef<HTMLAudioElement | null>(null)

  const startNewWord = useCallback(() => {
    setWord(getRandomWord())
    setWordPosition(0)
  }, [])

  const startGame = useCallback(() => {
    const randomStartTime = Math.floor(Math.random() * (MAX_START_TIME - MIN_START_TIME + 1) + MIN_START_TIME)
    setTimeLeft(randomStartTime)
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    startNewWord()
    if (startSoundRef.current) {
      startSoundRef.current.play()
    }
  }, [startNewWord])

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer)
            setGameOver(true)
            if (gameOverSoundRef.current) {
              gameOverSoundRef.current.play()
            }
            return 0
          }
          return prevTime - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [gameStarted, gameOver])

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const dropInterval = setInterval(() => {
        setWordPosition((prevPosition) => {
          if (prevPosition >= WORD_CONTAINER_HEIGHT) {
            startNewWord()
            setScoreChange(-word.length)
            setTimeout(() => setScoreChange(0), SCORE_CHANGE_DURATION)
            return 0
          }
          return prevPosition + 1
        })
      }, WORD_FALL_INTERVAL)

      return () => clearInterval(dropInterval)
    }
  }, [gameStarted, gameOver, startNewWord, word.length])

  useEffect(() => {
    if (timeLeft === 0 && !sandboxFlipped) {
      setSandboxFlipped(true)
      setTimeout(() => setSandboxFlipped(false), SANDBOX_FLIP_DURATION)
    }
  }, [timeLeft, sandboxFlipped])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    if (e.target.value.toLowerCase() === word.toLowerCase()) {
      const newScore = word.length
      setScore((prevScore) => prevScore + newScore)
      setScoreChange(newScore)
      setTimeout(() => setScoreChange(0), SCORE_CHANGE_DURATION)
      setInput("")
      startNewWord()
    }
  }

  return (
    <div className={styles.game}>
      <audio ref={startSoundRef} src="/start.mp3" />
      <audio ref={gameOverSoundRef} src="/gameover.mp3" />
      <div className={styles.stats}>
        <div
          className={`${styles.score} ${scoreChange > 0 ? styles.scoreUp : scoreChange < 0 ? styles.scoreDown : ""}`}
        >
          Score: {score}
        </div>
        <div className={styles.timerContainer}>
          <div>Time: {timeLeft}s</div>
          <div className={`${styles.sandboxTimer} ${sandboxFlipped ? styles.flipped : ""}`} />
        </div>
      </div>
      <div className={styles.wordContainer} style={{ height: WORD_CONTAINER_HEIGHT }}>
        {gameStarted && !gameOver && (
          <div className={styles.word} style={{ top: `${wordPosition}px` }}>
            {word}
          </div>
        )}
      </div>
      {!gameStarted && (
        <button onClick={startGame} className={styles.startButton}>
          Start Game
        </button>
      )}
      {gameStarted && !gameOver && (
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          className={styles.input}
          placeholder="Type the word here"
        />
      )}
      {gameOver && (
        <div className={styles.gameOver}>
          Game Over! Final Score: {score}
          <button onClick={startGame} className={styles.restartButton}>
            Play Again
          </button>
        </div>
      )}
    </div>
  )
}

