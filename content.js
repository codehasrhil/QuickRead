function getArticaleText() {
    const artical = document.querySelector("article");
    if(artical) return artical.innerText.trim();

    const paragraphs = Array.from(document.querySelectorAll("p"));
    if(paragraphs.length > 0){
        return paragraphs.map((p) => p.innerText).join("\n").trim();
    }else{
        console.log("no para found");
    }
    

}

chrome.runtime.onMessage.addListener((req, _sender,sendResponse) => {
    if(req.type === 'GET_ARTICLE_TEXT'){
        const text =  getArticaleText();
        console.log("Extracted text lenght:", text.length);
        sendResponse({text});
    }
    return true;
})