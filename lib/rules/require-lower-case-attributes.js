// # requireLowerCaseAttributes: `true`
//
// All attributes must be written in lower case. Files with `doctype xml` are ignored.
//
// ```pug
// //- Invalid
// div(Class='class')
//
// //- Valid
// div(class='class')
// ```

var svgAttrs = require('svg-element-attributes');
var utils = require('../utils');

function isInsideSVG(domPath) {
  return domPath.some(function (elm) {
    return elm.tag.toLowerCase() === 'svg';
  });
}

function isSVGAttr(tagName, attrName) {
  return (svgAttrs[tagName] || []).indexOf(attrName) !== -1;
}

module.exports = function () {};

module.exports.prototype = {
  name: 'requireLowerCaseAttributes',

  schema: {
    enum: [null, true]
  },

  configure: function (options) {
    utils.validateTrueOptions(this.name, options);
  },

  lint: function (file, errors) {
    var isXml;

    file.iterateTokensByType('doctype', function (token) {
      isXml = token.val === 'xml';
    });

    if (!isXml) {
      var domPath = [{ tag: ':root', indent: -1 }];

      file.getTokens().forEach(function (token) {
        switch (token.type) {
          case 'tag':
            while (domPath[domPath.length-1].indent >= token._indent) {
              domPath.pop();
            }
            domPath.push({
              tag: token.val,
              indent: token._indent
            });
            break;
          case 'attribute':
            if (token.name !== token.name.toLowerCase()) {
              // Skip if recognized as SVG attribute.
              if (isInsideSVG(domPath) && isSVGAttr(domPath[domPath.length-1].tag, token.name)) {
                return;
              }
              errors.add('All attributes must be written in lower case', token.line, token.col);
            }
            break;
        }
      });
    }
  }
};
