const contract_address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
let web3, contract, current_account;
let filterOnlyMine = false;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("connectionButton").addEventListener("click", connectWallet);
    document.getElementById("makePostBtn").addEventListener('click', makePost);
    document.getElementById("getPostBtn").addEventListener('click', () => { filterOnlyMine = false; drawPosts(); });
    document.getElementById("myPostsBtn").addEventListener('click', () => { filterOnlyMine = true; drawPosts(); });
    document.getElementById("clearPostBtn").addEventListener('click', clearPost);

    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        contract = new web3.eth.Contract(abi, contract_address);

        window.ethereum.on("accountsChanged", (accs) => {
            if (accs.length > 0) { current_account = accs[0]; enterToDapp(); }
        });
    }
});

const connectWallet = async () => {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    current_account = accounts[0];
    enterToDapp();
}

const enterToDapp = () => {
    document.getElementById("accountLabel").textContent = current_account;
    document.getElementById("dapp").hidden = false;
    drawPosts();
}

const makePost = async () => {
    const msg = document.getElementById("postInput").value;
    await contract.methods.create_post(msg).send({ from: current_account });
    document.getElementById("postInput").value = "";
    drawPosts();
}

const drawPosts = async () => {
    const allPosts = await contract.methods.get_posts().call();
    const container = document.getElementById("posts");
    container.innerHTML = "";

    allPosts.forEach((post) => {
        if (!post.exists) return;
        if (filterOnlyMine && post.author() !== current_account()) return;

        const div = document.createElement("div");
        div.style.border = "1px solid #ccc";
        div.style.margin = "10px 0";
        div.style.padding = "10px";

        const isAuthor = post.author() === current_account();

        div.innerHTML = [
            '<p><b>' + post.author + '</b></p>',
            '<p>' + post.message + '</p>',
            '<button onclick="like(' + post.id + ')">Like: ' + post.likes + '</button>',
            isAuthor ? '<button onclick="del(' + post.id + ')">Delete</button>' : ""
        ];
        container.appendChild(div);
    });
}

window.like = async (id) => {
    await contract.methods.toggle_like(id).send({ from: current_account });
    drawPosts();
}

window.del = async (id) => {
    await contract.methods.delete_post(id).send({ from: current_account });
    drawPosts();
}

const clearPost = async () => {
    await contract.methods.clear_posts().send({ from: current_account });
    drawPosts();
}