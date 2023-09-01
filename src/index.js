/* eslint-disable no-unused-vars */
/* eslint-disable prefer-destructuring */
import './styles/style.css';
import Spinner from './assets/spinner.gif';

const addUserBtn = document.querySelector('.add-user');
const refresh = document.querySelector('.refresh');
const ul = document.querySelector('.ul');
const loadImg = document.querySelector('.load');

const errorMsg = (message, color) => {
  const msg = document.querySelector('.msg');
  msg.style.display = 'block';
  msg.innerText = message;
  msg.style.background = color;
  setTimeout(() => {
    msg.style.display = 'none';
  }, 3000);
};

const saveGameId = (gameId) => {
  localStorage.setItem('gameId', gameId);
};

const getGameId = () => {
  const currentGame = localStorage.getItem('gameId');
  return currentGame;
};

let gameId = '';
const createGame = async () => {
  const game = 'Fifa-2023';

  try {
    const response = await fetch(
      'https://us-central1-js-capstone-backend.cloudfunctions.net/api/games/',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ name: game }),
      },
    );

    const data = await response.json();
    gameId = data.result.split(' ')[3];
    saveGameId(gameId);
  } catch (error) {
    errorMsg('An error occured', 'red');
  }
};

const addUser = async (e) => {
  const name = document.querySelector('.name').value;
  const score = document.querySelector('.score').value;

  const button = document.querySelector('.add-user');
  button.disabled = true;

  if (name === '' && score === '') {
    errorMsg('All fields are required', 'red');
  } else {
    try {
      const response = await fetch(`https://us-central1-js-capstone-backend.cloudfunctions.net/api/games/${getGameId()}/scores/`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({ user: name, score }),
      });

      document.querySelector('.name').value = '';
      document.querySelector('.score').value = '';

      const data = await response.json();
      errorMsg(data.result, 'green');
    } catch (error) {
      errorMsg('An error occured', 'red');
    }
  }

  button.disabled = false;
  e.preventDefault();
};

// function to refreah
const getUsers = async () => {
  const loader = document.createElement('img');
  loader.className = 'spinner';
  loader.src = Spinner;
  loadImg.appendChild(loader);

  try {
    setTimeout(async () => {
      const response = await fetch(`https://us-central1-js-capstone-backend.cloudfunctions.net/api/games/${getGameId()}/scores/`);
      const data = await response.json();
      const users = data.result;

      ul.innerHTML = '';

      if (users.length === 0) {
        const list = document.createElement('li');
        const p = document.createElement('p');
        p.className = 'error';
        p.textContent = 'No user available';
        list.appendChild(p);
        ul.appendChild(list);
      } else {
        users.forEach((user, index) => {
          const list = document.createElement('li');
          list.innerHTML = `
                    <span class="index">${index += 1}</span>
                    <p>${user.user}</p>
                    <span class="scores">${user.score}</span>
                    `;
          ul.appendChild(list);
        });
      }
      loader.style.display = 'none';
    }, 2000);
  } catch {
    errorMsg('An error occured', 'red');
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  gameId = getGameId();
  if (!gameId) {
    await createGame();
  }
  getUsers();
});
addUserBtn.addEventListener('click', addUser);
refresh.addEventListener('click', getUsers);
