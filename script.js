body {
    font-family: 'Rubik', sans-serif;
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #e0eafc, #cfdef3);
    min-height: 100vh;
    color: #2d3436;
    direction: rtl;
  }
  
  .fade-in {
    animation: fadeIn 0.5s ease-in;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .login-container {
    background: #fff;
    padding: 40px;
    border-radius: 15px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 400px;
    margin: auto;
    margin-top: 10vh;
  }
  
  .user-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }
  
  .user-list button,
  .input-group button {
    padding: 12px 20px;
    background: #0984e3;
    color: #fff;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.3s ease;
  }
  
  .user-list button:hover,
  .input-group button:hover {
    background: #0652dd;
  }
  
  header {
    background: #fff;
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  .logo {
    font-size: 24px;
    font-weight: bold;
    color: #0984e3;
  }
  
  .logo span {
    color: #00b894;
  }
  
  #menu-btn {
    background: none;
    font-size: 28px;
    color: #0984e3;
    border: none;
  }
  
  #menu {
    position: fixed;
    top: 60px;
    right: -250px;
    width: 250px;
    height: 100%;
    background: #fff;
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
    transition: right 0.3s ease;
    z-index: 9;
  }
  
  #menu.visible {
    right: 0;
  }
  
  #menu ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  #menu ul li {
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
  }
  
  #menu ul li a {
    text-decoration: none;
    color: #2d3436;
    font-weight: 500;
  }
  
  .section-card {
    background: #fff;
    padding: 25px;
    margin: 20px;
    border-radius: 20px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }
  
  .input-group {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .input-group input {
    flex: 1;
    padding: 12px;
    border: 2px solid #dfe6e9;
    border-radius: 12px;
    font-size: 16px;
  }
  
  .item-list {
    list-style: none;
    padding: 0;
  }
  
  .item-list li {
    background: #f9fbfd;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .item-list li span {
    flex: 1;
  }
  
  .item-list li button {
    margin-right: 10px;
    padding: 8px 15px;
    border: none;
    border-radius: 8px;
    background: #e17055;
    color: white;
    cursor: pointer;
  }
  
  .calendar-controls {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  
  .calendar {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
  }
  
  .calendar div {
    background: #f9fbfd;
    border-radius: 10px;
    padding: 10px;
    text-align: center;
    cursor: pointer;
  }
  
  .calendar .has-events {
    background: #00b894;
    color: white;
  }
  
  .carousel-container {
    display: flex;
    overflow-x: scroll;
    scroll-snap-type: x mandatory;
  }
  
  .carousel-item {
    min-width: 100%;
    scroll-snap-align: start;
    transition: transform 0.3s ease;
  }
  
  #messages .item-list li {
    flex-direction: column;
    align-items: flex-start;
  }
  
  #messages .item-list li span {
    margin-bottom: 5px;
    font-weight: 500;
  }