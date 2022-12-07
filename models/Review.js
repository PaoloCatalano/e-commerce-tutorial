const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide rating"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Please provide title"],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, "Please provide comment"],
      maxlength: 5000,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);
//una sola review per user per quel prodotto:
//si crea un undex che comprende quel prodotto e quel user e si imposta come UNIQUE
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

//metodo statico chiamato nello Schema
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    {
      $match: {
        product: productId, //example:  new ObjectId("61c749567db99928631a7bbd")
      },
    },
    {
      $group: {
        _id: null, //or "$product"
        averageRating: {
          $avg: "$rating",
        },
        numOfReviews: {
          $sum: 1,
        },
      },
    },
  ]);
  //result potrebbe non esistere se non ci sono reviews!!!!!!!
  //averageRating deve essere arrotondato
  //result[0] perche é un oggetto dentro un array, example: [{_id: null, averageRating: 3.3333333333333335, numOfReviews: 3}]
  try {
    await this.model("Product").findOneAndUpdate({
      averageRating: Math.ceil(result[0]?.averageRating || 0),
      numOfReviews: result[0]?.numOfReviews || 0,
    });
  } catch (error) {
    console.log(error);
  }
};

ReviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
});
ReviewSchema.post("remove", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model("Review", ReviewSchema);
