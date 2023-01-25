"use strict";
//Keyword Search.js is going to provide several JS functions that as a library can be called by other parts of the program. 
//They are a set of functions that allow the user to interact with the webpage.

var onet_ws = null;

//hides the element with the id that is passed in as an argument.
function hide_element(id) {
  document.getElementById(id).classList.add('d-none');
}

//removes the class 'd-none' from the element with the id 'id'.
function show_element(id) {
  document.getElementById(id).classList.remove('d-none');
}

//fills the element with the id with the text
function fill_element(id, text) {
  document.getElementById(id).textContent = text;
}

 // read_input, allows the user to input text into the webpage.
function read_input(id) {
    return document.getElementById(id).value;
}

 // disable_button, allows the user to disable a button.
function disable_button(id) {
  document.getElementById(id).disabled = true;
}
 // enable_button, allows the user to enable a button.
function enable_button(id) {
  document.getElementById(id).disabled = false;
}
 // button_is_disabled, allows the user to check if a button is disabled.
function button_is_disabled(id) {
  return document.getElementById(id).disabled;
}
 // attach_event, allows the user to attach an event to a button.
function attach_event(id, eventname, callback) {
  document.getElementById(id).addEventListener(eventname, callback);
}

function show_error(msg) {
  fill_element('errorMessage', msg);
  show_element('errorPanel');
}
function check_for_error(resp) {
  if (resp.hasOwnProperty('error')) {
    show_error(resp.error);
    show_element('errorPanel');
    return true;
  }
  return false;
}
function reset_error() {
  fill_element('errorMessage', '');
  hide_element('errorPanel');
}

//is the first function that is called when the page loads.
  // It sets the domainOrigin field to the current domain.
  // It hides the connectSuccess and searchSuccess divs.
  // It checks to see if the page is being loaded from an HTTP or HTTPS server.

function init_keyword_search_js() {
  fill_element('domainOrigin', document.location.protocol + '//' + document.location.host);
  reset_error();
  hide_element('connectSuccess');
  hide_element('searchSuccess');

      // If the page is not loaded, it shows an error message and hides the accountForm div.

  if (document.location.protocol != 'http:' && document.location.protocol != 'https:') {
    show_error('You must run this demo from an HTTP or HTTPS server.');
    hide_element('accountForm');
    return;
  }

    //1. It's creating a new instance of the OnetWebService class, passing in the username.
    //2. It's calling the about method on the OnetWebService instance, passing in a callback function.
    //3. The callback function is called when the about method returns.
    //4. The callback function checks for an error, and if there is one, it displays it.
    //5. If there is no error, the callback function fills in the version number and shows the success message.

  attach_event('accountForm', 'submit', function(e) {
    e.preventDefault();
    if (button_is_disabled('accountConnect')) { return; }
    reset_error();
    hide_element('connectSuccess');
    
    var username = read_input('accountName');
    if (username == '') {
      show_error('Please enter your O*NET Web Services username.');
      return;
    }
    
    onet_ws = new OnetWebService(username);
    disable_button('accountConnect');
    onet_ws.call('about', null, function(vinfo) {
      enable_button('accountConnect');
      if (check_for_error(vinfo)) { return; }
      
      fill_element('connectVersion', vinfo.api_version);
      show_element('connectSuccess');
    });
  });

   /* 1. oNet App is creating a new instance of the class, and passing in the name of the form.
    2. It's attaching an event handler to the form's submit event.
    3. It's preventing the default action of the form (which is to submit the form).
    4. It's checking to see if the submit button is disabled. If it is, it returns.
    5. It's resetting the error message.
    6. It's hiding the success message.
    7. It's hiding the "no results" message.
    8. It's hiding the results table.
    9. It's reading the value of the search query input.
    10. It's checking to see if the search query is empty. If it is, it shows an error message and returns.*/

  attach_event('searchForm', 'submit', function(e) {
    e.preventDefault();
    if (button_is_disabled('searchSubmit')) { return; }
    reset_error();
    hide_element('searchSuccess');
    hide_element('searchNoResults');
    hide_element('searchResults');
    
    var kwquery = read_input('searchQuery');
    if (kwquery == '') {
      show_error('Please enter one or more search terms.');
      return;
    }
    
    disable_button('searchSubmit');
    onet_ws.call('online/search', { keyword: kwquery, end: 5 }, function(kwresults) {
      enable_button('searchSubmit');
      if (check_for_error(kwresults)) { return; }
      
      fill_element('searchQueryEcho', kwquery);
      if (!kwresults.hasOwnProperty('occupation') || !kwresults.occupation.length) {
        show_element('searchNoResults');
      } else {
        for (var i = 0; i < 5; i++) {
          if (i >= kwresults.occupation.length) {
            hide_element('searchItem' + i);
          } else {
            fill_element('searchCode' + i, kwresults.occupation[i].code);
            fill_element('searchTitle' + i, kwresults.occupation[i].title);
            show_element('searchItem' + i);
          }
        }
        show_element('searchResults');
      }
      show_element('searchSuccess');
    });
  });
}
