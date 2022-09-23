'use strict';

var highlightRegExp = /highlight-(?:text|source)-([a-z0-9]+)/;

function highlightedCodeBlock (turndownService) {
  turndownService.addRule('highlightedCodeBlock', {
    filter: function (node) {
      var firstChild = node.firstChild;
      return (
        node.nodeName === 'DIV' &&
        highlightRegExp.test(node.className) &&
        firstChild &&
        firstChild.nodeName === 'PRE'
      )
    },
    replacement: function (content, node, options) {
      var className = node.className || '';
      var language = (className.match(highlightRegExp) || [null, ''])[1];

      return (
        '\n\n' + options.fence + language + '\n' +
        node.firstChild.textContent +
        '\n' + options.fence + '\n\n'
      )
    }
  });
}

function strikethrough (turndownService) {
  turndownService.addRule('strikethrough', {
    filter: ['del', 's', 'strike'],
    replacement: function (content) {
      return '~' + content + '~'
    }
  });
}

var indexOf = Array.prototype.indexOf;
var every = Array.prototype.every;
var rules = {};

rules.tableCell = {
  filter: ['th', 'td'],
  replacement: function (content, node) {
    return cell(content, node)
  }
};

rules.tableRow = {
  filter: 'tr',
  replacement: function (content, node) {
    var borderCells = '';
    var alignMap = { left: ':--', right: '--:', center: ':-:' };

    if (isHeadingRow(node)) {
      for (var i = 0; i < node.childNodes.length; i++) {
        var border = '---';
        var align = (
          node.childNodes[i].getAttribute('align') || ''
        ).toLowerCase();

        if (align) border = alignMap[align] || border;

        borderCells += cell(border, node.childNodes[i]);
      }
    }
    return '\n' + content + (borderCells ? '\n' + borderCells : '')
  }
};

rules.table = {
  // Only convert tables with a heading row.
  // Tables with no heading row are kept using `keep` (see below).
  filter: function (node) {
    return node.nodeName === 'TABLE' && isHeadingRow(node.rows[0])
  },

  replacement: function (content) {
    // Ensure there are no blank lines
    content = content.replace('\n\n', '\n');
    return '\n\n' + content + '\n\n'
  }
};

rules.tableSection = {
  filter: ['thead', 'tbody', 'tfoot'],
  replacement: function (content) {
    return content
  }
};

// A tr is a heading row if:
// - the parent is a THEAD
// - or if its the first child of the TABLE or the first TBODY (possibly
//   following a blank THEAD)
// - and every cell is a TH
function isHeadingRow (tr) {
  var parentNode = tr.parentNode;
  return (
    parentNode.nodeName === 'THEAD' ||
    (
      parentNode.firstChild === tr &&
      (parentNode.nodeName === 'TABLE' || isFirstTbody(parentNode)) &&
      every.call(tr.childNodes, function (n) { return n.nodeName === 'TH' })
    )
  )
}

function isFirstTbody (element) {
  var previousSibling = element.previousSibling;
  return (
    element.nodeName === 'TBODY' && (
      !previousSibling ||
      (
        previousSibling.nodeName === 'THEAD' &&
        /^\s*$/i.test(previousSibling.textContent)
      )
    )
  )
}

function cell (content, node) {
  var index = indexOf.call(node.parentNode.childNodes, node);
  var prefix = ' ';
  if (index === 0) prefix = '| ';
  return prefix + content + ' |'
}

function tables (turndownService) {
  turndownService.keep(function (node) {
    return node.nodeName === 'TABLE' && !isHeadingRow(node.rows[0])
  });
  for (var key in rules) turndownService.addRule(key, rules[key]);
}

function taskListItems (turndownService) {
  turndownService.addRule('taskListItems', {
    filter: function (node) {
      return node.type === 'checkbox' && node.parentNode.nodeName === 'LI'
    },
    replacement: function (content, node) {
      return (node.checked ? '[x]' : '[ ]') + ' '
    }
  });
}

function fixUrl(url) {
  if (!url) {
    return;
  }

  if (url.startsWith('//')) {
    return "".concat(window.location.protocol).concat(url);
  }

  if (url.startsWith('/')) {
    return "".concat(window.location.origin).concat(url);
  }

  return url;
}

function lazyLoadImage (turndownService) {
  turndownService.addRule('lazyLoadImage', {
    filter: ['img'],
    replacement: function replacement(_, node) {
      var attributes = ['data-src', 'data-original-src'];

      for (var _i = 0, _attributes = attributes; _i < _attributes.length; _i++) {
        var attribute = _attributes[_i];
        var dataSrc = node.getAttribute(attribute);

        if (dataSrc) {
          return "![](".concat(fixUrl(dataSrc), ")\n");
        }
      }

      var src = node.getAttribute('src');

      if (src) {
        return "![](".concat(fixUrl(node.getAttribute('src')), ")\n");
      }

      return '';
    }
  });
}

function hexoCodeBlock (turndownService) {
  turndownService.addRule('hexoCodeBlock', {
    filter: ['figure', 'table'],
    replacement: function replacement(content, node) {
      if (!(node instanceof HTMLElement)) {
        return content;
      }

      var language = '';

      if (node.tagName === 'FIGURE') {
        var className = node.getAttribute('class');

        if (className) {
          var match = className.match(/highlight (.*)/);

          if (match) {
            language = match[1];
          }
        }
      }

      var gutter = node.querySelector('.gutter');
      var code = node.querySelector('td.code');

      if (!code || !gutter) {
        return content;
      }

      var codeArray = Array.from(code.querySelectorAll('.line'));

      if (!Array.isArray(codeArray)) {
        return content;
      }

      var finalCode = codeArray.map(function (o) {
        return o.textContent;
      }).join('\n');
      return "```".concat(language, "\n").concat(finalCode, "\n```\n\n");
    }
  });
}

function noScript (turndownService) {
  turndownService.addRule('noscript', {
    filter: ['noscript'],
    replacement: function replacement() {
      return "";
    }
  });
}

function wechatCodeBlock (turndownService) {
  turndownService.addRule('wechatCodeBlock', {
    filter: function filter(node) {
      if (!(node instanceof HTMLElement)) {
        return false;
      }

      if (node.tagName !== 'SECTION') {
        return false;
      }

      if (!node.className || !node.className.includes('code-snippet__js')) {
        return false;
      }

      var pre = node.querySelector('pre.code-snippet__js');

      if (!pre) {
        return false;
      }

      var language = pre.getAttribute('data-lang');

      if (!language) {
        return false;
      }

      return true;
    },
    replacement: function replacement(content, node) {
      if (!(node instanceof HTMLElement)) {
        return content;
      }

      var pre = node.querySelector('pre.code-snippet__js');
      var language = pre.getAttribute('data-lang');
      var finalCode = Array.from(pre.querySelectorAll('code')).map(function (o) {
        return o.textContent;
      }).join('\n');
      return "```".concat(language, "\n").concat(finalCode, "\n```\n\n");
    }
  });
}

function ibmCodeBlock (turndownService) {
  turndownService.addRule('wechatCodeBlock', {
    filter: function filter(node) {
      if (!(node instanceof HTMLElement)) {
        return false;
      }

      if (node.tagName !== 'DIV') {
        return false;
      }

      if (!node.className || !node.className.includes('syntaxhighlighter')) {
        return false;
      }

      var code = node.querySelector('div.container');

      if (!code) {
        return false;
      }

      return true;
    },
    replacement: function replacement(content, node) {
      if (!(node instanceof HTMLElement)) {
        return content;
      }

      var codeNode = node.querySelector('div.container');
      var finalCode = Array.from(codeNode.querySelectorAll('.line')).map(function (o) {
        return o.textContent;
      }).join('\n');
      return "```\n".concat(finalCode, "\n```\n\n");
    }
  });
}

function mediumCodeBlock (turndownService) {
  turndownService.addRule('mediumCodeBlock', {
    filter: function filter(node) {
      if (!(node instanceof HTMLElement)) {
        return false;
      }

      if (node.tagName !== 'PRE') {
        return false;
      }

      if (!node.className) {
        return false;
      }

      var codeLine = node.querySelectorAll('span[data-selectable-paragraph]');

      if (!codeLine) {
        return false;
      }

      return true;
    },
    replacement: function replacement(content, node) {
      if (!(node instanceof HTMLElement)) {
        return content;
      }

      return "```\n".concat(content, "\n```\n\n");
    }
  });
}

function csdnCodeBlock (turndownService) {
  turndownService.addRule('csdnCodeBlock', {
    filter: function filter(node) {
      if (!(node instanceof HTMLElement)) {
        return false;
      }

      if (node.tagName !== 'PRE') {
        return false;
      }

      if (node.className !== 'prettyprint') {
        return false;
      }

      var codeLine = node.querySelectorAll('code');

      if (!codeLine) {
        return false;
      }

      return true;
    },
    replacement: function replacement(content, node) {
      var _node$querySelector;

      if (!(node instanceof HTMLElement)) {
        return content;
      }

      (_node$querySelector = node.querySelector('.pre-numbering')) === null || _node$querySelector === void 0 ? void 0 : _node$querySelector.remove();
      var codeBlock = node.querySelector('code');
      var code = codeBlock.textContent;
      var language = '';
      var languageMatchResult = codeBlock.className.match(/language-(.*) /);

      if (languageMatchResult) {
        language = languageMatchResult[1];
      }

      language = language.split(' ')[0];
      return "```".concat(language, "\n").concat(code, "\n```\n\n");
    }
  });
}

function findNotEmpty(data, index) {
  var expect = index;
  var start = 0;

  while (expect >= 0) {
    if (typeof data[start] === 'undefined') {
      expect--;

      if (expect < 0) {
        return start;
      }
    }

    start++;
  }

  return start;
}

function yuqueTableCard (turndownService) {
  turndownService.addRule('yuqueTableCard', {
    filter: function filter(node) {
      if (!(node instanceof HTMLElement)) {
        return false;
      }

      if (node.tagName !== 'TABLE') {
        return false;
      }

      if (node.getAttribute('class') !== 'lake-table') {
        return false;
      }

      return true;
    },
    replacement: function replacement(content, node) {
      if (!(node instanceof HTMLElement)) {
        return content;
      }

      var lines = node.querySelectorAll('tr');
      var jsonNodes = [];

      for (var _i = 0, _Array$from = Array.from(lines); _i < _Array$from.length; _i++) {
        var line = _Array$from[_i];
        var nodes = line.querySelectorAll('td');
        var nodesValue = Array.from(nodes).map(function (node) {
          return {
            colSpan: Number(node.getAttribute('colspan')) || 1,
            rowSpan: Number(node.getAttribute('rowspan')) || 1,
            content: Array.from(node.querySelectorAll('p')).map(function (o) {
              return o.textContent;
            }).join('<br />')
          };
        });
        jsonNodes.push(nodesValue);
      }

      var result = jsonNodes.map(function () {
        return [];
      });
      jsonNodes.forEach(function (row, rowIndex) {
        var foo = [];
        row.forEach(function (o) {
          var expectIndex = findNotEmpty(result[rowIndex], 0);

          for (var i = 0; i < o.colSpan; i++) {
            for (var j = 0; j < o.rowSpan; j++) {
              var first = i === 0 && j === 0;
              result[rowIndex + j][expectIndex + i] = first ? o.content : '';
            }
          }
        });
        return foo;
      });
      var divider = result[0].map(function () {
        return '-';
      });
      result.splice(1, 0, divider);
      return "".concat(result.map(function (row) {
        return "|".concat(row.join('|'), "|");
      }).join('\n'), "\n\n");
    }
  });
}

function mediumImage (turndownService) {
  turndownService.addRule('mediumImage', {
    filter: function filter(node) {
      if (!(node instanceof HTMLElement)) {
        return false;
      }

      if (node.tagName !== 'IMG') {
        return false;
      }

      if (!node.getAttribute('src') || !node.getAttribute('height') || !node.getAttribute('width')) {
        return false;
      }

      var src = node.getAttribute('src');

      if (!src.startsWith('https://miro.medium.com/max/')) {
        return false;
      }

      return true;
    },
    replacement: function replacement(content, node) {
      if (!(node instanceof HTMLElement)) {
        return content;
      }

      var src = node.getAttribute('src');
      var width = node.getAttribute('width');
      var result = src.replace(/https:\/\/miro.medium.com\/max\/(\d*)\//, "https://miro.medium.com/max/".concat(Number(width) * 2, "/"));
      return "![](".concat(result, ")");
    }
  });
}

function fixUrl$1(url) {
  if (!url) {
    return;
  }

  if (url.startsWith('//')) {
    return "".concat(window.location.protocol).concat(url);
  }

  if (url.startsWith('/')) {
    return "".concat(window.location.origin).concat(url);
  }

  return url;
}

function zhihuGif (turndownService) {
  turndownService.addRule('zhihuGif', {
    filter: function filter(node) {
      if (!(node instanceof HTMLElement)) {
        return false;
      }

      if (node.tagName !== 'IMG') {
        return false;
      }

      if (!node.getAttribute('class') || !node.getAttribute('data-thumbnail')) {
        return false;
      }

      var className = node.getAttribute('class');

      if (className !== 'ztext-gif') {
        return false;
      }

      return true;
    },
    replacement: function replacement(_, node) {
      var src = node.getAttribute('data-thumbnail');

      if (src) {
        var index = src.lastIndexOf('.');
        src = src.slice(0, index).concat('.gif');
        return "![](".concat(fixUrl$1(src), ")\n");
      }

      return '';
    }
  });
}

function gcoresGallery (turndownService) {
  turndownService.addRule('gcoresGallery', {
    filter: function filter(node) {
      if (!(node instanceof HTMLElement)) {
        return false;
      }

      if (node.tagName !== 'FIGURE') {
        return false;
      }

      var className = node.className;

      if (typeof className !== 'string' || !className.includes('story_block-atomic-gallery')) {
        return false;
      }

      return true;
    },
    replacement: function replacement(content, node) {
      var _node$querySelector, _node$querySelector2;

      if (!(node instanceof HTMLElement)) {
        return content;
      }

      var galleryItem = node.querySelectorAll('.gallery_item');

      if (!galleryItem || galleryItem.length <= 0) {
        return content;
      }

      var imageCount = galleryItem.length;
      var galleryIndex = (_node$querySelector = node.querySelector('.gallery_indexOf')) === null || _node$querySelector === void 0 ? void 0 : _node$querySelector.querySelectorAll('span');

      if (galleryIndex && galleryIndex[1]) {
        imageCount = parseInt(galleryIndex[1].textContent, 10) || galleryItem.length;
      }

      var title = (_node$querySelector2 = node.querySelector('.story_caption')) === null || _node$querySelector2 === void 0 ? void 0 : _node$querySelector2.textContent;
      var code = Array.from(galleryItem).slice(0, imageCount).map(function (o) {
        var _o$querySelector, _ref;

        var href = o.getAttribute('href');
        var gallery_imageCaption = (_o$querySelector = o.querySelector('.gallery_imageCaption')) === null || _o$querySelector === void 0 ? void 0 : _o$querySelector.textContent;
        return "![".concat((_ref = gallery_imageCaption !== null && gallery_imageCaption !== void 0 ? gallery_imageCaption : title) !== null && _ref !== void 0 ? _ref : '', "](").concat(href, ")");
      }).join('\n');
      return "".concat(code, "\n");
    }
  });
}

var codeBlock = (function (code, language) {
  var languageString = language;

  if (typeof language !== 'string') {
    languageString = '';
  }

  if (typeof code !== 'string' || !code) {
    return '';
  }

  return "```".concat(languageString, "\n").concat(code, "\n```\n\n");
});

function typoraCodeBlock (turndownService) {
  turndownService.addRule('mediumCodeBlock', {
    filter: function filter(node) {
      if (!(node instanceof HTMLElement)) {
        return false;
      }

      if (node.tagName !== 'PRE') {
        return false;
      }

      if (!node.className.includes('contain-cm')) {
        return false;
      }

      var firstChild = node.firstChild;

      if (!(firstChild instanceof HTMLElement)) {
        return false;
      }

      if (!firstChild.className.includes('CodeMirror')) {
        return false;
      }

      return true;
    },
    replacement: function replacement(content, node) {
      if (!(node instanceof HTMLElement)) {
        return content;
      }

      var codeMirrorLines = node.querySelectorAll('.CodeMirror-line');

      if (!codeMirrorLines || codeMirrorLines.length === 0) {
        return '';
      }

      var code = Array.from(codeMirrorLines).map(function (o) {
        return o.textContent;
      }).join('\n');
      var lang = node.getAttribute('lang');
      return codeBlock(code, lang);
    }
  });
}

function juejinCodeBlock (turndownService) {
  turndownService.addRule('juejinCodeBlock', {
    filter: function filter(node) {
      if (!(node instanceof HTMLElement)) {
        return false;
      }

      if (node.tagName !== 'PRE') {
        return false;
      }

      if (node.className === 'prettyprint') {
        return false;
      }

      var child = node.firstChild;

      if (!child) {
        return false;
      }

      if (child.tagName !== 'CODE') {
        return false;
      }

      if (!child.className.includes('hljs')) {
        return false;
      }

      return true;
    },
    replacement: function replacement(content, node) {
      var _node$querySelector, _node$firstChild, _node$firstChild2;

      if (!(node instanceof HTMLElement)) {
        return content;
      }

      (_node$querySelector = node.querySelector('.copy-code-btn')) === null || _node$querySelector === void 0 ? void 0 : _node$querySelector.remove();
      return "```".concat((_node$firstChild = node.firstChild) === null || _node$firstChild === void 0 ? void 0 : _node$firstChild.getAttribute('lang'), "\n").concat((_node$firstChild2 = node.firstChild) === null || _node$firstChild2 === void 0 ? void 0 : _node$firstChild2.textContent, "\n```\n\n");
    }
  });
}

function strong (turndownService) {
  turndownService.addRule('tag_string', {
    filter: ['b', 'strong'],
    replacement: function replacement(content) {
      if (typeof content !== 'string' || !content.trim()) {
        return '';
      }

      var result = content.trim();

      if (['：', '】', '▐', '。'].some(function (o) {
        return result.endsWith(o);
      })) {
        return "**".concat(result, "** ");
      }

      return "**".concat(result, "**");
    }
  });
}

function syntaxhighlighter (turndownService) {
  turndownService.addRule('syntaxhighlighter', {
    filter: function filter(node) {
      var _node$className;

      if (!(node instanceof HTMLElement)) {
        return false;
      }

      if (node.tagName !== 'TABLE') {
        return false;
      }

      var hasCss = !((_node$className = node.className) === null || _node$className === void 0 ? void 0 : _node$className.includes('syntaxhighlighter'));

      if (!hasCss) {
        return false;
      }

      if (!node.querySelector('.code') || !node.querySelector('.container')) {
        return false;
      }

      return true;
    },
    replacement: function replacement(content, node) {
      var _node$querySelector;

      if (!(node instanceof HTMLElement)) {
        return content;
      }

      var lines = ((_node$querySelector = node.querySelector('.container')) === null || _node$querySelector === void 0 ? void 0 : _node$querySelector.querySelectorAll('line')) || [];
      var finalCode = Array.from(lines).map(function (o) {
        return o.textContent;
      }).join('\n');
      return "```\n".concat(finalCode, "\n```\n\n");
    }
  });
}

function infoq_code (turndownService) {
  turndownService.addRule('infoq_code', {
    filter: function filter(node) {
      if (!(node instanceof HTMLElement)) {
        return false;
      }

      if (node.tagName !== 'DIV') {
        return false;
      }

      if (node.getAttribute('data-type') !== 'codeblock') {
        return false;
      }

      if (!node.querySelector('.simplebar') || !node.querySelector('[data-origin=pm_code_preview]')) {
        return false;
      }

      return true;
    },
    replacement: function replacement(content, node) {
      var _node$querySelectorAl;

      if (!(node instanceof HTMLElement)) {
        return content;
      }

      var lines = (_node$querySelectorAl = node.querySelectorAll('[data-type=codeline]')) !== null && _node$querySelectorAl !== void 0 ? _node$querySelectorAl : [];
      var finalCode = Array.from(lines).map(function (o) {
        return o.textContent;
      }).join('\n').trim();
      return "```\n".concat(finalCode, "\n```\n\n");
    }
  });
}

function wechatCodeBlock_02 (turndownService) {
  turndownService.addRule('wechatCodeBlock_02', {
    filter: function filter(node) {
      if (!(node instanceof HTMLElement)) {
        return false;
      }

      if (node.tagName !== 'SECTION') {
        return false;
      }

      if (!node.className.includes('code-snippet__github')) {
        return false;
      }

      if (!node.querySelector('pre') || node.querySelectorAll('code').length === 0) {
        return false;
      }

      return true;
    },
    replacement: function replacement(content, node) {
      if (!(node instanceof HTMLElement)) {
        return content;
      }

      var pre = node.querySelector('pre');
      var language = pre === null || pre === void 0 ? void 0 : pre.getAttribute('data-lang');
      var finalCode = Array.from(node.querySelectorAll('code')).map(function (o) {
        return o.textContent;
      }).join('\n');

      if (language) {
        return "```".concat(language, "\n").concat(finalCode, "\n```\n\n");
      }

      return "```\n".concat(finalCode, "\n```\n\n");
    }
  });
}

function plugins(turndownService) {
  turndownService.use([highlightedCodeBlock,
    strikethrough,
    tables,
    taskListItems, lazyLoadImage, hexoCodeBlock, noScript, wechatCodeBlock, wechatCodeBlock_02, ibmCodeBlock, mediumCodeBlock, csdnCodeBlock, yuqueTableCard, mediumImage, zhihuGif, gcoresGallery, typoraCodeBlock, juejinCodeBlock, strong, syntaxhighlighter, infoq_code]);
}
