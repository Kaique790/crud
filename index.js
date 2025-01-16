const port = 8080
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const { where } =  require('sequelize');
const Post = require('./models/Post')

// config handlebars
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// config body parser 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// routes
app.get('/', (req, res) => {
    Post.findAll()
        .then((posts) => {
            res.render('home', { posts: posts });
        })
});

app.post('/add', (req, res) => {
    Post.create({
        user: req.body.user,
        subject: req.body.subject,
        content: req.body.content
    }).then(() => {
        res.redirect('/')
    }).catch((error) => {
        'Houve um na criação do post: ' + error
    });
});

app.get('/delete/:id', (req, res) => {
    Post.destroy({
        where: {
            id: req.params.id
        }
    }).then(() => {
        res.redirect('/');
    }).catch((error) => {
        console.log('Houve um erro ao deletar o post: ', error);
        res.status(500).send('Erro ao deletar postagem');
    });
});

app.get('/edit/:id', (req, res) => {
    Post.findByPk(req.params.id)
        .then((post) => {
            if (post) {
                res.render('edit-post', { post: post })
            } else {
                res.status(400).send('Post não encontrado')
            }
        }).catch ((error) => {
            console.log('erro ao carregar a página ', error);
            res.status(500)
        })
});

app.post('/edit/update/:id', (req, res) => {
    const postId = req.params.id;
    const { user, subject, content } = req.body;

    Post.update({ user, subject, content }, { where: { id: postId } })
        .then(([updated]) => {
            if (updated) {
                res.redirect('/');
            } else {
                res.status(404).send('Post não encontrado');
            }
        })
        .catch(error => {
            console.log('Houve um erro na edição do post:', error);
            res.status(500).send('Erro ao atualizar post');
        });
});


app.listen(port, () => {
    console.log(`Executando servidor na porta: ${port}`);
});
