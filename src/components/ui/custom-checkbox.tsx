import React from 'react';
import styled from 'styled-components';

interface CustomCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  id: string;
}

export const CustomCheckbox = ({ checked, onCheckedChange, label, id }: CustomCheckboxProps) => {
  return (
    <StyledWrapper>
      <div className="checklist-item">
        <input
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          name={id}
          type="checkbox"
          id={id}
        />
        <label htmlFor={id}>{label}</label>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .checklist-item {
    --background: rgb(255, 250, 235);
    --text: #414856;
    --check: #105652;
    --disabled: #c3c8de;
    display: grid;
    grid-template-columns: 30px auto;
    align-items: center;
    width: 100%;
  }

  .checklist-item label {
    color: var(--text);
    position: relative;
    cursor: pointer;
    display: grid;
    align-items: center;
    width: fit-content;
    transition: color 0.3s ease;
  }

  .checklist-item label::before,
  .checklist-item label::after {
    content: "";
    position: absolute;
  }

  .checklist-item label::before {
    height: 2px;
    width: 8px;
    left: -27px;
    background: var(--check);
    border-radius: 2px;
    transition: background 0.3s ease;
  }

  .checklist-item label:after {
    height: 4px;
    width: 4px;
    top: 8px;
    left: -25px;
    border-radius: 50%;
  }

  .checklist-item input[type="checkbox"] {
    -webkit-appearance: none;
    -moz-appearance: none;
    position: relative;
    height: 15px;
    width: 15px;
    outline: none;
    border: 0;
    margin: 0 15px 0 0;
    cursor: pointer;
    background: var(--background);
    display: grid;
    align-items: center;
  }

  .checklist-item input[type="checkbox"]::before,
  .checklist-item input[type="checkbox"]::after {
    content: "";
    position: absolute;
    height: 2px;
    top: auto;
    background: var(--check);
    border-radius: 2px;
  }

  .checklist-item input[type="checkbox"]::before {
    width: 0px;
    right: 60%;
    transform-origin: right bottom;
  }

  .checklist-item input[type="checkbox"]::after {
    width: 0px;
    left: 40%;
    transform-origin: left bottom;
  }

  /* REVERSED: Show checkmark when CHECKED (not crossed out) */
  .checklist-item input[type="checkbox"]:checked::before {
    animation: check-01 0.4s ease forwards;
  }

  .checklist-item input[type="checkbox"]:checked::after {
    animation: check-02 0.4s ease forwards;
  }

  /* REVERSED: Cross out text when UNCHECKED */
  .checklist-item input[type="checkbox"]:not(:checked) + label {
    color: var(--disabled);
    animation: move 0.3s ease 0.1s forwards;
  }

  .checklist-item input[type="checkbox"]:not(:checked) + label::before {
    background: var(--disabled);
    animation: slice 0.4s ease forwards;
  }

  .checklist-item input[type="checkbox"]:checked + label::after {
    animation: firework 0.5s ease forwards 0.1s;
  }

  @keyframes move {
    50% {
      padding-left: 8px;
      padding-right: 0px;
    }

    100% {
      padding-right: 4px;
    }
  }

  @keyframes slice {
    60% {
      width: 100%;
      left: 4px;
    }

    100% {
      width: 100%;
      left: -2px;
      padding-left: 0;
    }
  }

  @keyframes check-01 {
    0% {
      width: 4px;
      top: auto;
      transform: rotate(0);
    }

    50% {
      width: 0px;
      top: auto;
      transform: rotate(0);
    }

    51% {
      width: 0px;
      top: 8px;
      transform: rotate(45deg);
    }

    100% {
      width: 5px;
      top: 8px;
      transform: rotate(45deg);
    }
  }

  @keyframes check-02 {
    0% {
      width: 4px;
      top: auto;
      transform: rotate(0);
    }

    50% {
      width: 0px;
      top: auto;
      transform: rotate(0);
    }

    51% {
      width: 0px;
      top: 8px;
      transform: rotate(-45deg);
    }

    100% {
      width: 10px;
      top: 8px;
      transform: rotate(-45deg);
    }
  }

  @keyframes firework {
    0% {
      opacity: 1;
      box-shadow: 0 0 0 -2px var(--check), 0 0 0 -2px var(--check), 0 0 0 -2px var(--check), 0 0 0 -2px var(--check), 0 0 0 -2px var(--check), 0 0 0 -2px var(--check);
    }

    30% {
      opacity: 1;
    }

    100% {
      opacity: 0;
      box-shadow: 0 -15px 0 0px var(--check), 14px -8px 0 0px var(--check), 14px 8px 0 0px var(--check), 0 15px 0 0px var(--check), -14px 8px 0 0px var(--check), -14px -8px 0 0px var(--check);
    }
  }
`;
