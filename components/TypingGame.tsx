"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { getRandomWord } from "../utils/wordList"
import styles from "../styles/TypingGame.module.css"

// Game parameters
const WORD_FALL_INTERVAL = 50 // milliseconds
const WORD_CONTAINER_HEIGHT = 400 // pixels
const SCORE_CHANGE_DURATION = 500 // milliseconds

export default function TypingGame() {
  const [word, setWord] = useState("")
  const [input, setInput] = useState("")
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [wordPosition, setWordPosition] = useState(0)
  const [scoreChange, setScoreChange] = useState(0)
  const [wordsCompleted, setWordsCompleted] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const startSoundRef = useRef<HTMLAudioElement | null>(null)
  const gameOverSoundRef = useRef<HTMLAudioElement | null>(null)
  const dropIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Add mounting ref
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Cleanup function for component unmount
    return () => {
      isMountedRef.current = false;
      if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current);
        dropIntervalRef.current = null;
      }
    };
  }, []);

  const startNewWord = useCallback(() => {
    if (!isMountedRef.current) return;
    if (wordsCompleted >= 10) {
      setGameOver(true)
      if (gameOverSoundRef.current) {
        gameOverSoundRef.current.play()
      }
      return;
    }
    setWord(getRandomWord())
    setWordPosition(0)
  }, [wordsCompleted])

  const startGame = useCallback(() => {
    if (dropIntervalRef.current) {
      clearInterval(dropIntervalRef.current)
      dropIntervalRef.current = null
    }
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    setWordsCompleted(0)
    setIsPaused(false)
    startNewWord()
    if (startSoundRef.current) {
      startSoundRef.current.play()
    }
  }, [startNewWord])

  const handlePause = useCallback(() => {
    if (isPaused) {
      // Resume game
      setIsPaused(false)
    } else {
      // Pause game
      setIsPaused(true)
      if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current)
        dropIntervalRef.current = null
      }
    }
  }, [isPaused])

  const handleStop = useCallback(() => {
    if (dropIntervalRef.current) {
      clearInterval(dropIntervalRef.current)
      dropIntervalRef.current = null
    }
    setGameOver(true)
    setGameStarted(false)
    setIsPaused(false)
    if (gameOverSoundRef.current) {
      gameOverSoundRef.current.play()
    }
  }, [])

  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused && isMountedRef.current) {
      dropIntervalRef.current = setInterval(() => {
        if (!isMountedRef.current) {
          if (dropIntervalRef.current) {
            clearInterval(dropIntervalRef.current);
            dropIntervalRef.current = null;
          }
          return;
        }
        
        setWordPosition((prevPosition) => {
          if (prevPosition >= WORD_CONTAINER_HEIGHT) {
            if (isMountedRef.current) {
              startNewWord();
              setScoreChange(-word.length);
              setTimeout(() => {
                if (isMountedRef.current) {
                  setScoreChange(0);
                }
              }, SCORE_CHANGE_DURATION);
            }
            return 0;
          }
          return prevPosition + 1;
        });
      }, WORD_FALL_INTERVAL);

      return () => {
        if (dropIntervalRef.current) {
          clearInterval(dropIntervalRef.current);
          dropIntervalRef.current = null;
        }
      };
    }
  }, [gameStarted, gameOver, isPaused, startNewWord, word.length])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isPaused || !isMountedRef.current) return;
    setInput(e.target.value);
    if (e.target.value.toLowerCase() === word.toLowerCase()) {
      if (!isMountedRef.current) return;
      const newScore = word.length;
      setScore((prevScore) => prevScore + newScore);
      setScoreChange(newScore);
      setWordsCompleted(prev => prev + 1);
      setTimeout(() => {
        if (isMountedRef.current) {
          setScoreChange(0);
        }
      }, SCORE_CHANGE_DURATION);
      setInput("");
      startNewWord();
    }
  };

  return (
    <div className={styles.game}>
      <audio ref={startSoundRef} src="/sounds/start.mp3" />
      <audio ref={gameOverSoundRef} src="/sounds/gameover.mp3" />
      <div className={styles.stats}>
        <div
          className={`${styles.score} ${scoreChange > 0 ? styles.scoreUp : scoreChange < 0 ? styles.scoreDown : ""}`}
        >
          Score: {score}
        </div>
        <div>Words: {wordsCompleted}/10</div>
        {gameStarted && !gameOver && (
          <div className={styles.gameControls}>
            <button 
              onClick={handlePause} 
              className={styles.controlButton}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button 
              onClick={handleStop} 
              className={styles.controlButton}
            >
              Stop
            </button>
          </div>
        )}
      </div>
      <div className={`${styles.wordContainer} ${isPaused ? styles.paused : ''}`} style={{ height: WORD_CONTAINER_HEIGHT }}>
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
          placeholder={isPaused ? "Game Paused" : "Type the word here"}
          disabled={isPaused}
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

