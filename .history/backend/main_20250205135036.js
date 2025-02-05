// Importation du module express
const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");

// Création d'une instance d'Express
const app = express();

// Middleware pour gérer les requêtes en JSON
app.use(express.json());

// Connexion à la base de données
const sequelize = new Sequelize("gamedatabase", "root", "root", {
  host: "localhost",
  dialect: "mysql",
});

// Vérifier la connexion
sequelize
  .authenticate()
  .then(() => console.log("Connexion à la base de données réussie"))
  .catch((err) =>
    console.error("Erreur de connexion à la base de données:", err)
  );

// Définition des modèles User et Game
const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
});

const Game = sequelize.define("Game", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users", // Nom de la table liée
      key: "id", // Clé primaire dans la table User
    },
  },
  time: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

// Définir l'association entre User et Game
User.hasMany(Game, { foreignKey: "userId" }); // Un utilisateur peut avoir plusieurs jeux
Game.belongsTo(User, { foreignKey: "userId" }); // Chaque jeu appartient à un utilisateur

// Synchroniser les modèles avec la base de données et créer les tables si elles n'existent pas
sequelize
  .sync()
  .then(() => console.log("Base de données et tables synchronisées"))
  .catch((err) => console.error("Erreur de synchronisation:", err));

// Route de base
app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l'api d'Escape from Antartica" });
});

app.get("/users", async (req, res) => {
  try {
    // Récupérer tous les utilisateurs
    const users = await User.findAll();

    // Vérifier si des utilisateurs existent
    if (users.length === 0) {
      return res.status(404).json({ message: "Aucun utilisateur trouvé" });
    }

    // Retourner la liste des utilisateurs
    res.json(users);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des utilisateurs" });
  }
});

// Route "/leaderboard" pour afficher le classement trié par temps
app.get("/leaderboard", async (req, res) => {
  try {
    // Récupérer le leaderboard trié par temps et un score par utilisateur
    const leaderboard = await Game.findAll({
      attributes: [
        "userId",
        [sequelize.fn("MIN", sequelize.col("time")), "minTime"], // Temps minimum pour chaque utilisateur
        [sequelize.fn("MAX", sequelize.col("score")), "maxScore"], // Score maximum pour chaque utilisateur
      ],
      include: [
        {
          model: User,
          attributes: ["name"], // Inclure le nom de l'utilisateur
        },
      ],
      group: ["userId"], // Grouper par utilisateur
      order: [[sequelize.fn("MIN", sequelize.col("time")), "ASC"]], // Trier par le temps le plus bas
    });

    // Vérifier si des données sont présentes
    if (leaderboard.length === 0) {
      return res.status(404).json({ message: "Aucun leaderboard disponible" });
    }

    // Formater les résultats
    const result = leaderboard.map((item) => ({
      name: item.User.name,
      score: item.dataValues.maxScore,
      time: item.dataValues.minTime,
    }));

    // Retourner la réponse
    res.json(result);
  } catch (error) {
    console.error("Erreur dans la récupération du leaderboard", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération du leaderboard" });
  }
});

//Route pour ajouter un utilisateur
app.post("/adduser", async (req, res) => {
  const { name } = req.body; // On récupère le nom de l'utilisateur depuis la requête

  // Vérifier si le nom a été fourni
  if (!name) {
    return res
      .status(400)
      .json({ error: "Le nom de l'utilisateur est requis" });
  }

  try {
    // Créer un nouvel utilisateur
    const newUser = await User.create({ name });

    // Retourner l'utilisateur créé
    res.status(201).json({
      message: "Utilisateur ajouté avec succès",
      user: newUser,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'utilisateur", error);
    res.status(500).json({ error: "Erreur lors de l'ajout de l'utilisateur" });
  }
});

// Route pour ajouter un jeu
app.get("/addgame", async (req, res) => {
    console
  return 3;
});

// Démarrer le serveur sur le port 3000
app.listen(3000, () => {
  console.log("Serveur démarré sur http://localhost:3000");
});
