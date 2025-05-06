document.addEventListener('DOMContentLoaded', function() {
    const messagesContainer = document.getElementById('messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const queryButtons = document.querySelectorAll('.query-btn');
    const uploadButton = document.getElementById('upload-button');
    const fileUploadInput = document.getElementById('file-upload');
    
    
    // API endpoint (replace with your n8n webhook URL)
    // const apiEndpoint = 'https://your-n8n-instance.com/webhook/chat-endpoint';

    //Endpoint to my n8n workflow
    // const apiEndpoint = 'http://localhost:5678/webhook/63239d00-924b-44de-b0eb-478bbbfdb05c/chat';

    const apiEndpoint = 'https://adisak2.app.n8n.cloud/webhook/5f1c0c82-0ff9-40c7-9e2e-b1a96ffe24cd/chat';

    let sessionId = "some session id";

    function generateSessionID(){
         
    }
    // Add event listeners
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    queryButtons.forEach(button => {
        button.addEventListener('click', function() {
            userInput.value = this.textContent;
            sendMessage();
        });
    });

    // Event listener for the upload button
    uploadButton.addEventListener('click', () => {
        fileUploadInput.click();
    });

    // Event listener for file selection
    fileUploadInput.addEventListener('change', (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            uploadFile(selectedFile);
        }
    });

    // Function to upload the file
    async function uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Send the file to the backend
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('File upload failed');
            }

            const data = await response.json();
            addMessage(`File "${file.name}" uploaded successfully!`, 'bot');
        } catch (error) {
            console.error('Error:', error);
            addMessage('Sorry, there was an error uploading your file.', 'bot');
        }
    }
    
    // Send message function
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        addMessage(message, 'user');
        userInput.value = '';
        
        // Show loading indicator
        showLoading();
        
        // Send to API
        fetchResponse(message);
    }

    // Configure marked.js options
    marked.setOptions({
    breaks: true, // Enable line breaks
    sanitize: true, // Sanitize HTML to prevent XSS attacks
});


    function addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);

        // Use marked.js to parse Markdown content
        const formattedContent = marked(content);

        messageDiv.innerHTML = `<div class="message-content">${formattedContent}</div>`;
        messagesContainer.appendChild(messageDiv);

        // Scroll to the bottom of the messages container
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function addMessage(content, sender, citations = [], sources = []) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
    
        // let formattedContent = content;
        let formattedContent = marked.parse(content);
    
        // Format citations
        if (sender === 'bot' && citations.length > 0) {
            citations.forEach((citation, index) => {
                const regex = new RegExp(`\\[${index + 1}\\]`, 'g');
                formattedContent = formattedContent.replace(regex, `<span class="citation">${index + 1}</span>`);
            });
        }
    
        // Format sources into a list
        if (sources.length > 0) {
            const sourcesHTML = `
                <div class="source-list">
                    <h4>Sources</h4>
                    <ul>
                        ${sources.map((source, index) => `<li><strong>${index + 1}.</strong> ${source}</li>`).join('')}
                    </ul>
                </div>
            `;
            formattedContent += sourcesHTML;
        }
    
        // Wrap content in paragraphs for better readability
        // formattedContent = `<p>${formattedContent.replace(/\n/g, '</p><p>')}</p>`;
    
        messageDiv.innerHTML = `<div class="message-content">${formattedContent}</div>`;
        messagesContainer.appendChild(messageDiv);
    
        // Scroll to the bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    
    // Add message to chat
    // function addMessage(content, sender, citations = [], sources = []) {
    //     const messageDiv = document.createElement('div');
    //     messageDiv.classList.add('message', `${sender}-message`);
        
    //     let messageContent = content;
        
    //     // If it's a bot message with citations, format them
    //     if (sender === 'bot' && citations.length > 0) {
    //         // Replace citation markers with formatted citations
    //         citations.forEach((citation, index) => {
    //             const regex = new RegExp(`\\[${index + 1}\\]`, 'g');
    //             messageContent = messageContent.replace(regex, `<span class="citation">${index + 1}</span>`);
    //         });
            
    //         // Add sources section if available
    //         if (sources.length > 0) {
    //             messageContent += `
    //                 <div class="source-list">
    //                     <h4>Sources</h4>
    //                     ${sources.map((source, index) => 
    //                         `<div class="source-item">
    //                             <strong>${index + 1}.</strong> ${source}
    //                         </div>`
    //                     ).join('')}
    //                 </div>
    //             `;
    //         }
    //     }
        
    //     messageDiv.innerHTML = `<div class="message-content">${messageContent}</div>`;
    //     messagesContainer.appendChild(messageDiv);
        
    //     // Scroll to the bottom
    //     messagesContainer.scrollTop = messagesContainer.scrollHeight;
    // }
    
    // Show loading indicator
    function showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('message', 'bot-message', 'loading-indicator');
        loadingDiv.innerHTML = `
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
        `;
        loadingDiv.id = 'loading-indicator';
        messagesContainer.appendChild(loadingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Hide loading indicator
    function hideLoading() {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
    }
    
    // Fetch response from the API
    async function fetchResponse(message) {
        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chatInput: message,
                    sessionId: sessionId,
                })
            });
            
            if (!response.ok) {
                throw new Error('API request failed');
            }
            
            const data = await response.json();
            console.log(data);
            hideLoading();
            
            // Process and display the response
            addMessage(
                data.output || data.response, 
                'bot',
                data.citations || [],
                data.sources || []
            );
            
        } catch (error) {
            console.error('Error:', error);
            hideLoading();
            addMessage('Sorry, I encountered an error processing your request. Please try again.', 'bot');
        }
    }
    
    // Welcome message
    setTimeout(() => {
        addMessage('Hello! I\'m your research assistant powered by RAG. How can I help you today?', 'bot');
    }, 500);
});
