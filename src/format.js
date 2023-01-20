const beautify = require('js-beautify').js;

// const code = ` // Back-end complete function Template for C++\r\n\r\nclass Solution {\r\n    int ans, g;\r\n\r\n    void solve(Node *root)\r\n    {\r\n        if(root==NULL)\r\n        return;\r\n        if(root->left!=NULL && root->right!=NULL)\r\n        {\r\n            int h=__gcd(root->left->data,root->right->data);\r\n            if(h>g)\r\n            {\r\n                g=h;\r\n                ans=root->data;\r\n            }\r\n            else if(h==g)\r\n            {\r\n                ans=max(ans,root->data);\r\n            }\r\n        }\r\n        solve(root->left);\r\n        solve(root->right);\r\n    }\r\n\r\npublic:\r\n    int maxGCD(Node* root) {\r\n        ans = 0;\r\n        g = 0;\r\n        solve(root);\r\n        return ans;\r\n    }\r\n};\r\n`;

function formatCode(code) {
    return beautify(code, { indent_size: 4 });
}

function formatCookie(cookieJson) {
    let cookiesText = "";

    cookieJson = formatIfCookieLenghtIsNotDefined(cookieJson);

    for (let i = 0; i < cookieJson.length; i++) {
        cookiesText += cookieJson[i].name + "=" + cookieJson[i].value + "; ";
    }
    return cookiesText;
}

function formatIfCookieLenghtIsNotDefined(cookieJson) {
    if (!cookieJson.length) {
        cookieJson = [cookieJson];
    }
    return cookieJson;
}



module.exports = { formatCode, formatCookie }