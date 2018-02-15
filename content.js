function reformatAll() {
  $('div[data-message-id]').each(function() {
    reformatMail($(this));
  });
}

function reformatMail(mail) {
  const container = findContainer(mail);
  if (!container) {
    return;
  }
  
  const body = cutFooter(container.text());
  const data = JSON.parse(body);
  const content = quotedPrintable.decode(cutHeader(data.content));
  container.html(decodeHtml(content));
}

function cutFooter(content) {
  var cutPoint = content.length;
  for (let i = 0; i < content.length-2; i++) {
    if (content.slice(i, i+3) === '--\n') {
      cutPoint = i - 1;
    }
  }
  return content.slice(0, cutPoint);
}

function decodeHtml(html) {
  const text = document.createElement('textarea');
  text.innerHTML = html;
  return text.value;
}

function cutHeader(content) {
  for (let i = 0; i < content.length-4; i++) {
    if (/\r\n\r\n[^\-]/.test(content.slice(i, i+5))) {
      return content.slice(i+4);
    }
  }

  return content;
}

// while has children
// for each child
//   if child does not have children
//     and child text trimmed contains { as first character,
//       return the child
function findContainer(mail) {
  const content = mail.contents();

  if (content.length > 0) {
    for (let i = 0; i < content.length; i++) {
      const node = findContainer(content.eq(i));

      if (node === 'found') {
        return mail;
      } else if (node) {
        return node;
      }
    }

  } else {
    const firstChar = mail.text().trim()[0];
    if (firstChar === '{' || firstChar === '[') {
      return 'found';
    }
  }

  return null;
}

function getData(mail) {
  const prefix = mail.find('table').eq(0).text();
  const snsData = mail.text().replace(prefix, '');

  return snsData;
}

chrome.runtime.onMessage.addListener(
  function(req, sender, sendResponse) {
    if (req.message === "clicked_browser_action") {
      reformatAll();
    }
  }
);
