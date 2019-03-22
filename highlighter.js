function Highlighter(classToObserve, insertedClassWhitelist, textContainerClassWhitelist, highlights) {

    this.run = function() {
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
            for (let i = 0; i < insertedClassWhitelist.length; i++) {
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

    function escapeHighlightsRegExp(str) {
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
}