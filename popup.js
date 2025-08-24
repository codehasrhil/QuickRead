document.getElementById("summarize").addEventListener("click", () => {
    const resultDiv = document.getElementById("result");
    const summerytype = document.getElementById("summary-type").value;

    resultDiv.innerHTML = '<div class="loader"></div>';



    // 1 get the user's APIKEY

    chrome.storage.sync.get(['geminiApiKey'], ({ geminiApiKey }) => {
        if (!geminiApiKey) {
            resultDiv.textContent = "No API Key set. Click the gear icon to add one.";
            return;
        }

        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            console.log("test 1 pass");
            chrome.tabs.sendMessage(tab.id, { type: "GET_ARTICLE_TEXT" }, async (response) => {
                console.log("test 2 pass")
               
                try {
                    const summary = await getGeminiSummary(response.text, summerytype, geminiApiKey);
                    resultDiv.textContent = summary
                } catch (error) {
                    resultDiv.textContent = "Gemini error: " + error.message;
                }
            });
        })
    })

    // 2 ask content.js for the page text



})

// 3 send text to gemini

async function getGeminiSummary(rawText, type, apikey) {
    const max = 20000;
    const text = rawText.length > max ? rawText.slice(0, max) + "..." : rawText;

    const promptMap = {
        brief: `Summarize in 2-3 sentences:\n\n${text}`,
        detailed: `Give a detailed summary:\n\n${text}`,
        bullets: `Summarize in 5-7 bullet points (start each line with"- "):\n\n${text}`
    };

    const prompt = promptMap[type] || promptMap.brief;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apikey}`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2 }
        })
    })

    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error?.message || "Reqquest failed");
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No summary."
}

document.getElementById("copy-btn").addEventListener("click",() => {
    const txt = document.getElementById("result").innerText;
    if(!txt) return;

    navigator.clipboard.writeText(txt).then(() => {
        const btn = document.getElementById("copy-btn");
        const old = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = old
        }, 2000);
    })
})


