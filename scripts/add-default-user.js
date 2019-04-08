print("Adding default user...");
    db.users.insertOne({
    "username": "Frank",
    "password": "$2b$12$W60PE1hnpK7hXpfKO0VCmOx4MvCQoV5iPRXa600pfA2I1e8mrW/Fe",
    "created": new Date()
});
