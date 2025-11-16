import React from "react";

const loaderStyles = `
  .emerald-loader-wrapper {
    width: 200px;
    height: 60px;
    position: relative;
    z-index: 1;
  }

  .emerald-loader-circle {
    width: 20px;
    height: 20px;
    position: absolute;
    border-radius: 50%;
    background-color: #ffffff;
    left: 15%;
    transform-origin: 50%;
    animation: emerald-circle-bounce .5s alternate infinite ease;
  }

  @keyframes emerald-circle-bounce {
    0% {
      top: 60px;
      height: 5px;
      border-radius: 50px 50px 25px 25px;
      transform: scaleX(1.7);
    }

    40% {
      height: 20px;
      border-radius: 50%;
      transform: scaleX(1);
    }

    100% {
      top: 0%;
    }
  }

  .emerald-loader-circle:nth-child(2) {
    left: 45%;
    animation-delay: .2s;
  }

  .emerald-loader-circle:nth-child(3) {
    left: auto;
    right: 15%;
    animation-delay: .3s;
  }

  .emerald-loader-shadow {
    width: 20px;
    height: 4px;
    border-radius: 50%;
    background-color: rgba(0,0,0,0.9);
    position: absolute;
    top: 62px;
    transform-origin: 50%;
    z-index: -1;
    left: 15%;
    filter: blur(1px);
    animation: emerald-shadow-scale .5s alternate infinite ease;
  }

  @keyframes emerald-shadow-scale {
    0% {
      transform: scaleX(1.5);
    }

    40% {
      transform: scaleX(1);
      opacity: .7;
    }

    100% {
      transform: scaleX(.2);
      opacity: .4;
    }
  }

  .emerald-loader-shadow:nth-child(4) {
    left: 45%;
    animation-delay: .2s;
  }

  .emerald-loader-shadow:nth-child(5) {
    left: auto;
    right: 15%;
    animation-delay: .3s;
  }
`;

const Loader: React.FC = () => {
  return (
    <>
      <style>{loaderStyles}</style>
      <div className="emerald-loader-wrapper">
        <div className="emerald-loader-circle" />
        <div className="emerald-loader-circle" />
        <div className="emerald-loader-circle" />
        <div className="emerald-loader-shadow" />
        <div className="emerald-loader-shadow" />
        <div className="emerald-loader-shadow" />
      </div>
    </>
  );
};

export default Loader;
