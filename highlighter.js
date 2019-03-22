function Highlighter(classToObserve, insertedClassWhitelist, textContainerClassWhitelist, highlights) {

    this.run = function() {
        var elementToObserve = document.getElementsByClassName(classToObserve)[0];
        insertedClassWhitelist.forEach(function(insertedClass) {
            var InsertElements = elementToObserve.getElementsByClassName(insertedClass);
            Array.prototype.forEach.call(InsertElements, function(insertedElement) {
                processInsertedNode(insertedElement);
            });
        });

        var mutationObserver = new MutationObserver(onMutationsObserved);
        mutationObserver.observe(elementToObserve, {
            childList: true,
            subtree: true
        })
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
                if (node.className !== insertedClassWhitelist[i]) {
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
                processTextNodes(textNodes);
            });
        });
    }

    function processTextNodes(textNodes) {
        textNodes.forEach(function(textNode) {
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
                newInnerHTML = newInnerHTML.replace(new RegExp('(' + highlight[0] + ')', 'gmi'), highlightMarkup);

                highlightAdded = true;
            });

            if (!highlightAdded) {
                return;
            }
            
            textNode.parentNode.innerHTML = newInnerHTML;
        });
    }

    function getHighlightMarkup(highlight) {
        return '<a class="highlight" href="' + highlight[2] + '" data-balloon="' + highlight[1] + '" data-balloon-pos="up" target="_blank">$1</a>';
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