export default `
.Modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.25);
    display: flex;
  }
  
  .Modal .Modal-content {
    max-width: 700px;
    max-height: 70vh;
    min-width: 400px;
    background-color: white;
    margin: auto;
    border-radius: 5px;
    padding: 1.5em;
  }
  
  .Modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgb(214, 214, 214);
    padding-bottom: 0.5em;
  }
  
  .Modal-header button {
    border: 0;
    cursor: pointer;
  }
  
  .Modal-header h3 {
    margin: 0;
  }
  
  .Modal-option-list {
    margin: 0;
    list-style-type: none;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
  }
  
  .Modal-option-list li {
    padding: 1em;
    cursor: pointer;
    border: 1px solid rgb(214, 214, 214);
    border-radius: 5px;
    display: flex;
  }
  
  .Modal-option-list li div {
    margin: auto;
  }
  
  .Modal-option-list li:hover {
    border-color: black;
  }
  
  .Modal-option-list li img {
    display: block;
    margin: 0 auto;
    margin-bottom: 5px;
    max-width: 50px;
  }
  
  .Modal-dark-theme .Modal-content {
    background-color: #26292a;
    color: white;
  }
  
  .Modal-dark-theme .Modal-content .Modal-option-list li {
    border-color: black;
  }
  
  .Modal-dark-theme .Modal-content .Modal-option-list li:hover {
    border-color: white;
  }
  
  @media (prefers-color-scheme: dark) {
    .Modal:not(.Modal-light-theme) .Modal-content {
      background-color: #26292a !important;
      color: white;
    }
  
    .Modal:not(.Modal-light-theme) .Modal-content .Modal-option-list li {
      border-color: black;
    }
  
    .Modal:not(.Modal-light-theme) .Modal-content .Modal-option-list li:hover {
      border-color: white;
    }
  }  
`;
