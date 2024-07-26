db.consultations.createIndex({
    "person" : 1,
    "control.active" : 1,
    "control.created_at" : -1
})

db.consultations.createIndex({
    "control.created_at" : -1
})


db.persons.createIndex({
    "user" : 1
})
db.persons.createIndex({
    "idQflow" : 1
})