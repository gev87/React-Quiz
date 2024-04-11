import { useEffect, useReducer } from "react";

import DateCounter from "./components/DateCounter";
import Header from "./components/Header";
import Main from "./components/Main";
import Loader from "./components/Loader";
import Error from "./components/Error";
import StartScreen from "./components/StartScreen";
import Question from "./components/Question";
import NextButton from "./components/NextButton";
import Progress from "./components/Progress";
import FinishScreen from "./components/FinishScreen";
import Footer from "./components/Footer";
import Timer from "./components/Timer";


const SECS_PER_QUESTION = 30;

const initialstate = {
  questions: [],
  status: "loading",
  index: 0,
  answer: null,
  points: 0,
  maxPoints: 0,
  highScore: 0,
  secondsRemaining: null,
  maxPossiblePoints: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "dataRecieved":
      const totalPoints = action.payload.reduce(
        (start, question) => start + question.points,
        0
      );
      return {
        ...state,
        questions: action.payload,
        status: "ready",
        maxPossiblePoints: totalPoints,
      };
    case "dataFailed":
      return { ...state, status: "error" };
    case "start":
      return {
        ...state,
        status: "active",
        secondsRemaining: state.questions.length * SECS_PER_QUESTION,
      };
    case "restart":
      return {
        ...initialstate,
        status: "ready",
        highScore: state.highScore,
        questions: state.questions,
        maxPossiblePoints: state.maxPossiblePoints,
      };
    case "finish":
      const isNewHighScore = state.points > state.highScore;
      return {
        ...state,
        status: "finished",
        highScore: isNewHighScore ? state.points : state.highScore,
      };
    case "newAnswer":
      const question = state.questions[state.index];
      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points,
      };
    case "nextQuestion":
      return { ...state, answer: null, index: state.index + 1 };
    case "tick":
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
        status: state.secondsRemaining === 0 ? "finished" : state.status,
      };
    default:
      throw new Error("Unknown action");
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialstate);
  const {
    questions,
    status,
    index,
    answer,
    points,
    maxPossiblePoints,
    highScore,
    secondsRemaining,
  } = state;
  const numQuestions = questions.length;

  useEffect(() => {
    fetch("http://localhost:8000/questions")
      .then((res) => res.json())
      .then((data) => dispatch({ type: "dataRecieved", payload: data }))
      .catch((err) => dispatch({ type: "dataFailed" }));
  }, []);

  return (
    <div className="app">
      <Header />
      <Main>
        {status === "loading" && <Loader />}
        {status === "error" && <Error />}
        {status === "ready" && (
          <StartScreen numQuestions={numQuestions} dispatch={dispatch} />
        )}
        {status === "active" && (
          <>
            <Progress
              points={points}
              maxPossiblePoints={maxPossiblePoints}
              index={index}
              numQuestions={numQuestions}
              answer={answer}
            />
            <Question
              question={questions[index]}
              dispatch={dispatch}
              answer={answer}
            />
            <Footer>
              <Timer dispatch={dispatch} secondsRemaining={secondsRemaining} />
              {answer !== null && (
                <NextButton
                  dispatch={dispatch}
                  index={index}
                  numQuestions={numQuestions}
                />
              )}
            </Footer>
          </>
        )}

        {status === "finished" && (
          <FinishScreen
            points={points}
            maxPossiblePoints={maxPossiblePoints}
            highScore={highScore}
            dispatch={dispatch}
          />
        )}
      </Main>
      {/* <DateCounter /> */}
    </div>
  );
}

export default App;
