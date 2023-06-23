/*
All rights reserved to Muktar SayedSaleh @ 2023
*/

const arabic_regex = /[\u0600-\u06FF]/g; // Arabic letters utf-8 range
const selectors = '.postArticle-content, section.eh, p, h1, h2, h3, header, ol, ul';

let fix_rtl = () => {
    document
        .querySelectorAll(selectors)
        .forEach(element => {
            if (!arabic_regex.test(element.textContent)) {
                // not arabic so we don't have to do anything
                return;
            }

            // for arabic text we need to set the direction to rtl
            element.style.direction = 'rtl';
            element.style.textAlign = 'right';
            element.style.fontFamily = 'sans-serif';

            // custom fixes for some elements
            if (element.nodeName === 'HEADER') {
                element.querySelectorAll(".avatar, .followState")
                    .forEach(element => {
                        if(element)
                        {
                            element.style.marginRight = '10px';
                            element.style.marginLeft = '10px';
                        }
                    });
            }

            // TODO: Add more fixes
        });
};

// As Medium doesn't support rtl for ol, ul, and li elements
// we need to override the default styles
const custom_styles = document.createElement('style');
custom_styles.innerHTML = `
    ol.rtl, ul.rtl, .postList.rtl, .rtl {
        direction: rtl;
    }
`;
document.head.appendChild(custom_styles);

new MutationObserver(fix_rtl)
    .observe(
        document.body,
        {
            childList: true,
            subtree: true
        }
    );
