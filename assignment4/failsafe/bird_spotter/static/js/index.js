"use strict";

function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

let app = {}
app.empty_new_bird = {"id": 0, "name": "", "habitat": "", "weight": 0, "sightings": 0},
app.config = {
    data: function() {
        return {
            new_bird: clone(app.empty_new_bird),            
            birds: [],
            selected_birds: [],
            editing: {current: null},
            errors: {}  // <-- NEW
        };
    },    
    methods: {       
        search: function() {
            this.cancel();
            this.selected_birds = this.birds.filter((bird)=>{return bird.name.toLowerCase().includes(this.new_bird.name.toLowerCase()); });
        },
        add_bird: function() {
            this.cancel();
            if (this.selected_birds.length == 0 && this.new_bird.name.length > 1) {
                let bird = clone(this.new_bird);
                let options = {
                    method: "POST",
                    headers: {
                        'Content-Type': "application/json"
                    },
                    body: JSON.stringify({ name: bird.name })
                };
                fetch("/bird_spotter/api/birds", options)
                    .then(response => response.json())
                    .then(data => {
                        bird.id = data.id;
                        app.vue.birds.push(bird);
                        app.vue.selected_birds = [bird];
                        app.vue.new_bird = clone(app.empty_new_bird);
                    });
            }
        },
        edit: function(bird) {
            this.cancel();
            this.editing = {current: bird, old: clone(bird)};
        },
        // save: function(bird) {
        //     bird = clone(bird);            
        //     delete bird.id;
        //     delete bird.name;
        //     // PUT bird to /bird_spotter/birds/{bird.id}            
        //     this.editing = {current: null};
        // },
        save: function(bird) {
            let updated_data = {
                habitat: bird.habitat,
                weight: parseFloat(bird.weight)
            };
        
            fetch(`/bird_spotter/api/birds/${bird.id}`, {
                method: "PUT",
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify(updated_data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.errors && Object.keys(data.errors).length > 0) {
                    // Store errors in errors dict using bird.id as key
                    this.errors[bird.id] = data.errors;
                } else {
                    this.editing = {current: null};
                    delete this.errors[bird.id]; // clear previous errors
                }
            });
        },        
        cancel: function() {
            if (this.editing.current)
                for(var key in this.editing.current)
                    this.editing.current[key] = this.editing.old[key];
            this.editing = {current: null};
        },
        // add_sighting: function(bird) {
        //     bird.sightings += 1;
        //     // POST {} to /bird_spotter/birds/{bird.id}/increase_sightings
        // },
        add_sighting: function(bird) {
            fetch(`/bird_spotter/api/birds/${bird.id}/increase_sightings`, {
                method: "POST"
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    bird.sightings += 1;
                }
            });
        },        
        color: function(name) {            
            let hash = 0;
            for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);            
            let ret = `hsl(${(hash % 360)}, 100%, 75%)`;                         
            console.log(ret);
            return ret;
        },
    }
};
// app.load_data = function() {
//     // GET from /bird_spotter/birds {birds: [...]} and store it into app.vue.birds = [...]
// }

app.load_data = function() {
    fetch("/bird_spotter/api/birds") // GET all birds
        .then(response => response.json())
        .then(data => {
            app.vue.birds = data.birds;
            app.vue.selected_birds = data.birds;
        });
};


app.vue = Vue.createApp(app.config).mount("#app");
app.load_data();