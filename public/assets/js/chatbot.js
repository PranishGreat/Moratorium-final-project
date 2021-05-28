console.log("chat2.js");
var date=new Date();
function extra() {
  var u = document.getElementById("messages");
  var listNode = document.createElement("li");
  listNode.className = "message left appeared";

  divAvatar = document.createElement("div");
  divAvatar.className = "avatar";
  divWrap = document.createElement("div");
  divWrap.className = "text_wrapper";
  divText = document.createElement("div");
  divText.className = "text";

  listNode.appendChild(divAvatar);
  listNode.appendChild(divWrap);
  divWrap.appendChild(divText);
  u.appendChild(listNode);
}

function setUserResponce(text) {
  var ele =
    '<li class="message right appeared"><div class="avatar"><img class="imgs" src="img/user.png" /></div><div class="text_wrapper"><div class="text">' +
    text +
    "</div></div></li>";
    if(text.length>=1)
    { $(ele).appendTo(".messages");
      callToApi(text);
    }
    else
    {
      swal("Wrong!", "Please Enter Characters", "error");
    }
  cleartext();
}
function setBotResponce(test) {
  console.log(test);
  var ele =
    '<li class="message left appeared"><div class="avatar"><img class="imgs" src="img/bot.jpg" /></div><div class="text_wrapper"><div class="text">' +
    test +
    "</div></div></li>";
	$(ele).appendTo(".messages");
  scrollToBottomOfResults();
}

function setBotResponceBtn(val) {
  console.log(val.title);
  var ele =
    '<li class="message left appeared">' +
    '<div class="singleCard">' +
    '<div class="suggestions">' +
    '<div class="menu">' +
    '<div class="menuChips" data-payload="' +
    val.payload +
    '">' +
    val.title +
    "</div>" +
    "</div>" +
    "</div>" +
    " </div>" +
    "</li>";

  $(ele).appendTo(".messages");
  // scrollToBottomOfResults();
}

function setBotResponceImg(val) {
  var v =
    `<li class="message left appeared">
          <div class="singleCard">
					<img class="imgcard" src="` +
    val +
    `"alt="` +
    val +
    `">
						</div><div class="clearfix">
        </li>`;
  $(v).appendTo(".messages").prop("messages.scrollHeight");

}

async function callToApi(text) {
  data = {
    sender:""+date,
    message: text,
  };
  url = "https://eritodypimrnlu.herokuapp.com/webhooks/rest/webhook";
  option = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  response = await fetch(url, option);
  ResponseData = await response.json();
  filterBot(ResponseData);
}


function filterBot(val) {
  for (i = 0; i < val.length; i++) {
    if (val[i].hasOwnProperty("text")) {
      setBotResponce(val[i].text);
    }
    if (val[i].hasOwnProperty("image")) {
      setBotResponceImg(val[i].image);
    }
    if (val[i].hasOwnProperty("buttons")) {
      addSuggestion(val[i].buttons);
    }
  }
}

function addSuggestion(buttons) {
  var suggestions = buttons;
  var suggLength = buttons.length;
  for (i = 0; i < suggLength; i++) {
    setBotResponceBtn(suggestions[i]);
  }
}
$(document).on("click", ".menu .menuChips", function () {
  var text = this.innerText;
  var payload = this.getAttribute("data-payload");
  console.log("button payload: ", this.getAttribute("data-payload"));
  setUserResponce(text);
  send(payload);
  $(".suggestions").remove(); //delete the suggestions
});

function playAudio(url) {
  new Audio(url).play();
}

window.onload = function () {
  setTimeout(function () {
    document.getElementById("popup").style.display = "block";
    playAudio("./res/service.wav");
  }, 3000);
};


function openChat() {
	document.getElementById("openChat").style.display = "block";
	document.getElementById("popup").style.display = "none";
	setBotResponce("Hello");
	callToApi("menu");
  }

function closeChat() {
	console.log("click");
	document.getElementById("openChat").style.display = "none";
	document.getElementById("popup").style.display = "block";
	setBotResponce("/stop");
	var ul1 = document.getElementById('msgul');
  	ul1.innerHTML=' ';
  }

function cleartext(){
	document.getElementById('userMessage').value = '';
	console.log("text1");
}

function scrollToBottomOfResults() {
	const messages = document.getElementById('msgul');
	messages.scrollTop = messages.scrollHeight;
  }




