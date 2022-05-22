let db;
const request = indexedDB.open('budget_app', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_account_action', { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadAccountAction();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
}

function saveRecord(record) {
    const transaction = db.transaction(['new_account_action'], 'readwrite');
    const accountObjectStore = transaction.objectStore('new-account_action');
    accountObjectStore.add(record);
};

function uploadAccountAction() {
    const transaction = db.transaction(['new_account_action'], 'readwrite');
    const accountObjectStore = transaction.objectStore('new_account_action');
    const getAll = accountObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json' 
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message) {
                    throw new Error(serverResponse);
                }

                const transaction = db.transaction(['new_account_action'], 
                'readwrite');
                const accountObjectStore = transaction.objectStore('new_account_action');

                accountObjectStore.clear();
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
} 

window.addEventListener('online', uploadAccountAction);