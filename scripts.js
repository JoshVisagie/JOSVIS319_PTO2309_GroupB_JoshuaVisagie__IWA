//imports data.js
import { authors, books, genres, BOOKS_PER_PAGE } from "./data.js";

/**
 * global variables
 */
let booksPerPage = BOOKS_PER_PAGE;
const fragment = document.createDocumentFragment();
/**an array that will show all the books to display taking the filters into account */
let booksToDisplay = [];
/**an array that will will be all of the books currently being displayed on screen*/
let extracted=[];
/**filter variables*/
let titleFilter = null;
let genreFilter = null;
let authorFilter = null;

/**
 * a list of query selectors from index.html
 */
const HTML = {
  
  header: {
    search: document.querySelector("[data-header-search]"),
    settings: document.querySelector("[data-header-settings]"),
  },
  list: {
    items: document.querySelector("[data-list-items]"),
    message: document.querySelector("[data-list-message]"),
    button: document.querySelector("[data-list-button]"),
  },

  activeList: {
    overlay: document.querySelector("[data-list-active]"),
    preview: document.querySelector("[data-list-blur]"),
    content: document.querySelector(".overlay_content"),
    title: document.querySelector("[data-list-title]"),
    subtitle: document.querySelector("[data-list-subtitle]"),
    description: document.querySelector("[data-list-description]"),
    button: document.querySelector("[data-list-close]"),
  },

  search: {
    overlay: document.querySelector("[data-search-overlay]"),
    title: document.querySelector("[data-search-title]"),
    genre: document.querySelector("[data-search-genres]"),
    author: document.querySelector("[data-search-authors]"),
    cancelButton: document.querySelector("[data-search-cancel]"),
  },

  settings: {
    overlay : document.querySelector("[data-settings-overlay]"),
    theme : document.querySelector("[data-settings-theme]"),
    cancelButton: document.querySelector("[data-settings-cancel]"),
    submitButton : document.querySelector(".overlay__button_primary")
  }
};

/**
 * this updates the list of books that will be displayed based on any filters that have been applied
 *
 */
const toDisplay = () => {
  booksToDisplay = [];
    
  for (const singleBook of books) {
    const hasMatchingGenre = singleBook.genres.some(
      (genre) => genre === genreFilter
    );

    if (
      (genreFilter === null || hasMatchingGenre) &&
      (titleFilter === null ||
        singleBook.title.toLowerCase().includes(titleFilter.toLowerCase().trim())) &&
      (authorFilter === null || singleBook.author === authorFilter)
    ) {
      booksToDisplay.push(singleBook);
    }
  }

  
};

toDisplay();
extracted = booksToDisplay.slice(0, booksPerPage);

/**
 * a function to update the 'Show More:' button
 */
const buttonUpdate = () => {
  let{button}=HTML.list

  let buttonValue = booksToDisplay.length - booksPerPage;
  button.className = "list__button";

  if (buttonValue <= 0) {
    buttonValue = 0;
    button.disabled = true;
  } else {
    button.disabled = false;
  }

    button.innerHTML = `
        <span>Show More:</span>
      <span class="list__remaining">(${buttonValue})</span>
      `;
};

buttonUpdate();

/**
 * this function increases the books per page by 36
 */
const previewMore = (event) => {
  const extract = booksToDisplay.slice(booksPerPage, booksPerPage + 36);
  booksPerPage = booksPerPage + 36;

  addFragment(extract);
  buttonUpdate();
};

/**
 * this takes an object called book and creates element with the html for a single
 * book.
 * @param {object} book
 * @returns element
 */
const createPreview = (book) => {
  const { title, image, author, id } = book;
  const element = document.createElement("div");
  const refAuthor = authors[author];

  element.dataset.id = id;
  element.className = "preview";
  element.innerHTML = `
        <img src= ${image} class ="preview__image"alt="${title}'s bookcover">
        <div class="list__items">       
          <div class='preview__title'>${title}</div>
          <div class="preview__author">${refAuthor}</div> 
        </div>                    
        `;
  return element;
};

/**
 * this factory function takes a selector from the html as an element
 * and a object to populate that selector. It also creates the first element with the text 'any' and value =null
 * @param {Element} element
 * @param {Object} object
 */
const SelectPopulator = (element, object) => {
  const anyOption = document.createElement("option");
  anyOption.value = null;
  anyOption.text = `Any`;
  element.appendChild(anyOption);

  for (const key in object) {
    const name = object[key];
    const option = document.createElement("option");
    option.value = key;
    option.textContent = name;
    element.appendChild(option);
  }
};

SelectPopulator(HTML.search.genre, genres);
SelectPopulator(HTML.search.author, authors);

/**
 * this loop goes through all of the books that have been extracted and  uses
 * the factory function create preview to  in the items div
 */
const addFragment = (extract) => {
  
  let {items}=HTML.list

  for (const book of extract) {
    fragment.append(createPreview(book));
  }
  items.appendChild(fragment);
};

addFragment(extracted);

/**
 *  This event toggles the search overlay when the search or cancel buttons
 */
const searchOverlay = () => {
  let{overlay, title }=HTML.search

  if (!overlay.open === true) {
    overlay.open = true;
    title.focus();
  } else {
    overlay.open = false;
  }
};

/**
 * This function activates when someone someone submits the search form
 * It takes updates all the filters from the forms title, genre and author
 * it clears the items div and assigns the updated booksToDisplay[] to create
 * a new selection of books
 *
 * if there are no books within the search range it shows shows the message
 *
 * @param {event} event
 */
const filterSearch = (event) => {
  let {title, genre, author, overlay} = HTML.search
  let {message} = HTML.list
//destructer
  event.preventDefault();
  HTML.list.items.innerHTML = "";

  titleFilter = title.value;
  genreFilter = genre.value;
  if (genreFilter === "null") genreFilter = null;
  authorFilter = author.value;
  if (authorFilter === "null") authorFilter = null;

  overlay.open = false;
  toDisplay();
  extracted = booksToDisplay.slice(0, booksPerPage);
  addFragment(extracted);
  buttonUpdate();

  if (booksToDisplay.length === 0) {
    message.classList.add("list__message_show");
  } else {
    message.classList.remove("list__message_show");
  }
};


const selectedBookToggle = (event)=>{
  let { overlay, preview , title, subtitle, description, content } = HTML.activeList;
  
  const selectedBookElement = event.target.closest(".preview")
    if (selectedBookElement) {
        const bookId = selectedBookElement.dataset.id
        const selectedBook = books.find(book => book.id === bookId);
    if(selectedBook){
        title.textContent =`${ selectedBook.title} (${selectedBook.published.slice(0,4)})`
        //add date function
        subtitle.textContent = authors[selectedBook.author]
        description.textContent = selectedBook.description
        description.style ="overflow-y:scroll"
        preview.src = selectedBook.image

        overlay.open = true;
      
       const imageElement = selectedBookElement.querySelector("img").cloneNode(true);
         
        overlay.insertBefore(imageElement, preview.parentElement)
        imageElement.classList.add('overlay__image')
        imageElement.classList.remove('preview__image')
    }
  }
}
/**
 * this closes the overlay of book you have selected
 * @param {event} event 
 */
const closeSelectedBook = (event) =>{
  let {overlay} = HTML.activeList;
  overlay.open=false;
}
/**
 * this toggles the settings overlay open and closed when pushing the settings
 * button on the header or the cancel button on the form
 * @param {event} event 
 */
const settingsOverlay =(event)=>{
  let{overlay, theme  }=HTML.settings
  if (!overlay.open === true) {
    overlay.open = true;
    theme.focus();
  } else {
    overlay.open = false;
  }
};

HTML.settings.theme.value = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day'

/**
 * this functions changes the look color mode of the website when the submit
 * form is submitted
 * @param {event} event 
 */
const changeSettings =(event)=>{
  event.preventDefault();

  let{theme, overlay} = HTML.settings
  const colorMode = theme.value
  
  document.documentElement.style.setProperty('--color-dark', cssColors[colorMode].dark)
  document.documentElement.style.setProperty('--color-light', cssColors[colorMode].light)
  overlay.open = false;
}
/**
 * this is a list of Colors for CSS. They will be accessed when we change the 
 * color mode of the website
 */
const cssColors = {
  day: {
    dark: "10, 10, 20",
    light: "255, 255, 255",
  },

  night: {
    dark: "255, 255, 255",
    light: "10, 10, 20",
  },
};

HTML.list.button.addEventListener("click", previewMore);
HTML.header.search.addEventListener("click", searchOverlay);
HTML.search.overlay.addEventListener("submit", filterSearch);
HTML.search.cancelButton.addEventListener("click", searchOverlay);
HTML.list.items.addEventListener('click', selectedBookToggle)
HTML.activeList.button.addEventListener('click', closeSelectedBook)
HTML.settings.overlay.addEventListener("submit", changeSettings);
HTML.header.settings.addEventListener('click', settingsOverlay)
HTML.settings.cancelButton.addEventListener('click', settingsOverlay)






//if(!books && !Array.isArray(books)) throw new Error('Source required') 
//if(!range && range.length < 2) throw new Error('Range must be an array with two numbers')



 
// v = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches? 'night' | 'day'
