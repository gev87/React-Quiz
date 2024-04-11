import { useEffect } from "react";

function Timer({ secondsRemaining, dispatch }) {
  const seconds = secondsRemaining % 60;
  const minutes = (secondsRemaining - seconds) / 60;

  useEffect(() => {
    const timeId = setInterval(() => {
      dispatch({ type: "tick" });
    }, 1000);
    return () => {
      clearInterval(timeId);
    };
  }, [dispatch]);

  return (
    <div className="timer">
      {minutes < 10 && "0"}
      {minutes} : {seconds < 10 && "0"}
      {seconds}
    </div>
  );
}
export default Timer;
