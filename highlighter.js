function Highlighter(classToObserve, insertedClassWhitelist, textContainerClassWhitelist, highlights) {

    this.run = function() {
        injectCss();
        escapeHighlightsRegExp();
        highlightCurrentDocument();
        startMutationObserver();
    }

    function highlightCurrentDocument() {
        var elementToObserve = document.getElementsByClassName(classToObserve)[0];
        insertedClassWhitelist.forEach(function(insertedClass) {
            var InsertElements = elementToObserve.getElementsByClassName(insertedClass);
            Array.prototype.forEach.call(InsertElements, processInsertedNode);
        });
    }

    function startMutationObserver() {
        var elementToObserve = document.getElementsByClassName(classToObserve)[0];
        var mutationObserver = new MutationObserver(onMutationsObserved);
        mutationObserver.observe(elementToObserve, {
            childList: true,
            subtree: true
        });
    }

    function getTextNodes(el) {
        var node;
        var textNodes = [];
        var treeWalker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);

        while (node = treeWalker.nextNode()) {
            textNodes.push(node);
        }

        return textNodes;
    }

    function processMutationRecord(mutationRecord) {
        Array.prototype.forEach.call(mutationRecord.addedNodes, function(node) {
            for (var i = 0; i < insertedClassWhitelist.length; i++) {
                if (!node.classList) {
                    return;
                }

                if (!node.classList.contains(insertedClassWhitelist[i])) {
                    continue;
                }

                processInsertedNode(node);

                return;
            }
        });
    }

    function processInsertedNode(insertedNode) {
        textContainerClassWhitelist.forEach(function(textContainerClass) {
            Array.prototype.forEach.call(insertedNode.getElementsByClassName(textContainerClass), function(textContainerNode) {
                var textNodes = getTextNodes(textContainerNode);
                textNodes.forEach(processTextNode);
            });
        });
    }

    function processTextNode(textNode) {
        if (!textNode.parentNode || textNode.parentNode.nodeName === 'SCRIPT') {
            return;
        }

        var highlightAdded = false;
        var newInnerHTML = textNode.parentNode.innerHTML;
        var lowerCaseTextContent = textNode.textContent.toLowerCase();
        highlights.forEach(function(highlight) {
            if (lowerCaseTextContent.indexOf(highlight[0].toLowerCase()) < 0) {
                return;
            }

            var highlightMarkup = getHighlightMarkup(highlight);
            newInnerHTML = newInnerHTML.replace(new RegExp('(' + highlight[3] + ')', 'gmi'), highlightMarkup);

            highlightAdded = true;
        });

        if (!highlightAdded) {
            return;
        }

        textNode.parentNode.innerHTML = newInnerHTML;
    }

    function getHighlightMarkup(highlight) {
        return '<a class="highlight" href="' + highlight[2] + '" highlighter-tooltip="' + highlight[1] + '" target="_blank">$1</a>';
    }

    function escapeHighlightsRegExp() {
        highlights.forEach(function(highlight) {
            highlight.push(highlight[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        });
    }

    function onMutationsObserved(mutationRecords) {
        mutationRecords.forEach(function(mutationRecord) {
            if (mutationRecord.addedNodes.length === 0) {
                return;
            }

            processMutationRecord(mutationRecord);
        });
    }

    function injectCss() {
        var styleEl = document.createElement('style');
        styleEl.innerHTML =
        'a.highlight,' +
        'a.highlight:hover {' +
            'position: relative;' +
            'text-decoration: none;' +
            'color: #000000;' +
            'background-color: #F6DF6C;' +
            'padding: 1px;' +
        '}' +

        'a.highlight:before {' +
            'position: absolute;' +
            'content: "";' +
            'bottom: 100%;' +
            'left: 50%;' +
            'transform: translate(0, 12px);' +
            'opacity: 0;' +
            'width: 0;' +
            'height: 0;' +
            'border: 8px solid transparent;' +
            'border-top-color: #111111;' +
            'border-bottom: 0;' +
            'margin-left: -8px;' +
            'margin-right: -8px;' +
            'margin-bottom: 4px;' +
            'z-index: 10;' +
            'pointer-events: none;' +
            'transition: all 0.18s ease-out 0.18s;' +
        '}' +

        'a.highlight:after {' +
            'position: absolute;' +
            'content: attr(highlighter-tooltip);' +
            'bottom: 100%;' +
            'left: 50%;' +
            'transform: translate(-50%, 12px);' +
            'opacity: 0;' +
            'pointer-events: none;' +
            'font-family: sans-serif !important;' +
            'font-weight: normal !important;' +
            'font-style: normal !important;' +
            'text-shadow: none !important;' +
            'font-size: 12px !important;' +
            'background: #111111;' +
            'border-radius: 4px;' +
            'color: #FFFFFF;' +
            'padding: .5em 1em;' +
            'margin-bottom: 11px;' +
            'white-space: nowrap;' +
            'z-index: 10;' +
            'transition: all 0.18s ease-out 0.18s;' +
        '}' +

        'a.highlight:hover:before {' +
            'pointer-events: auto;' +
            'opacity: 1;' +
            'transform: translate(0, 0);' +
        '}' +

        'a.highlight:hover:after {' +
            'pointer-events: auto;' +
            'opacity: 1;' +
            'transform: translate(-50%, 0);' +
        '}';

        document.head.appendChild(styleEl);
    }
}