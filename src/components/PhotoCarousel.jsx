import React from "react";

export default function PhotoCarousel() {
  return (
    <div className="carousel">
      <button className="arrow">←</button>
      <div className="photos">
        <div className="photo"></div>
        <div className="photo"></div>
        <div className="photo"></div>
        <div className="photo"></div>
      </div>
      <button className="arrow">→</button>
    </div>
  );
}
