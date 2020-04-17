//jshint esversion:6

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProgrammeSchema = new mongoose.Schema({


    nom_programme: {
        type: String
    },

    duree_ent: {
        type: Number
    },

    num_ex_total: {
        type: Number
    },

    num_ex_01: {
        nom_ex: {
            type: String
        },
        num_ser: {
            type: Number
        },
        num_rep: {
            type: Number
        }

    },

    num_ex_02: {
        nom_ex: {
            type: String
        },
        num_ser: {
            type: Number
        },
        num_rep: {
            type: Number
        }
    },

    num_ex_03: {
        nom_ex: {
            type: String
        },
        num_ser: {
            type: Number
        },
        num_rep: {
            type: Number
        }
    },

    num_ex_04: {
        nom_ex: {
            type: String
        },
        num_ser: {
            type: Number
        },
        num_rep: {
            type: Number
        }
    },

    niveau: {
        type: String,
        required: true
    },

    programme_img: {
        type: String
    }
});

mongoose.model("programmes", ProgrammeSchema);