import React from "react";
import Table from 'react-bootstrap/Table';
import { Button } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import { Modal } from "react-bootstrap";

interface Usuario {
    ID: number;
    Nome: string;
    Email: string;
}

interface UsuariosState {
    ID: number;
    Nome: string;
    Email: string;
    usuarios: Usuario[];
    modalAberto: boolean;
}

class Usuarios extends React.Component<{}, UsuariosState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            ID: 0,
            Nome: '',
            Email: '',
            usuarios: [],
            modalAberto: false
        }
    }

    componentDidMount = () => {
        this.buscarUsuario();
    }

    buscarUsuario = () => {
        fetch("http://localhost:8601/api/usuario/")
            .then(resposta => resposta.json())
            .then((dados: Usuario[]) => {
                this.setState({ usuarios: dados })
            })
    }

    deletarUsuario = (ID: number) => {
        fetch(`http://localhost:8601/api/usuario/${ID}`, { method: 'DELETE' })
            .then(resposta => {
                if (resposta.ok) {
                    this.buscarUsuario();
                }
            })
    }

    carregarUsuario = (ID: number) => {
        fetch(`http://localhost:8601/api/usuario/${ID}`, { method: 'GET' })
            .then(resposta => resposta.json())
            .then((dados: Usuario) => {
                this.setState({
                    ID: dados.ID,
                    Nome: dados.Nome,
                    Email: dados.Email
                })
                this.abrirModal()
            })
    }

    cadastraUsuario = (usuario: Omit<Usuario, 'ID'>) => {
        fetch("http://localhost:8601/api/usuario/",
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuario)
            })
            .then(resposta => {
                if (resposta.ok) {
                    this.buscarUsuario();
                } else {
                    alert('Não foi possivel adicionar o usuario');
                }
            })
    }

    atualizarUsuario = (usuario: Usuario) => {
        fetch(`http://localhost:8601/api/usuario/${usuario.ID}`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuario)
            })
            .then(async resposta => {
                if (resposta.ok) {
                    this.buscarUsuario();
                } else {
                    const erro = await resposta.json();
                    alert(erro.error);
                }
            })
    }

    renderTabela() {
        return (
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <td>Nome</td>
                        <td>Email</td>
                        <td>Opções</td>
                    </tr>
                </thead>
                <tbody>
                    {this.state.usuarios.map((usuario) =>
                        <tr key={usuario.ID}>
                            <td>{usuario.Nome}</td>
                            <td>{usuario.Email}</td>
                            <td>
                                <Button variant="secondary" onClick={() => this.carregarUsuario(usuario.ID)}>Atualizar</Button>
                                <Button variant="danger" onClick={() => this.deletarUsuario(usuario.ID)}>Delete</Button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        )
    }

    atualizaNome = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            Nome: e.target.value
        })
    }

    atualizaEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            Email: e.target.value
        })
    }

    submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (this.state.ID === 0) {
            const usuario = {
                Nome: this.state.Nome,
                Email: this.state.Email
            }

            this.cadastraUsuario(usuario);
        } else {
            const usuario = {
                ID: this.state.ID,
                Nome: this.state.Nome,
                Email: this.state.Email
            }

            this.atualizarUsuario(usuario);
        }
        this.fecharModal()
    }

    handleSubmitButtonClick = () => {
        const form = document.getElementById('usuarioForm') as HTMLFormElement;
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }

    reset = () => {
        this.setState({
            ID: 0,
            Nome: '',
            Email: ''
        })
        this.abrirModal()
    }

    fecharModal = () => {
        this.setState({ modalAberto: false })
    }

    abrirModal = () => {
        this.setState({ modalAberto: true })
    }

    render() {
        return (
            <div>

                <Modal show={this.state.modalAberto} onHide={this.fecharModal} animation={false}>
                    <Modal.Header closeButton>
                        <Modal.Title>Dados do usuario</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form id="usuarioForm" onSubmit={this.submit}>
                            <Form.Group className="mb-3">
                                <Form.Label>ID</Form.Label>
                                <Form.Control type="text" value={this.state.ID} readOnly={true} />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Nome</Form.Label>
                                <Form.Control type="text" placeholder="Digite o nome do usuario" value={this.state.Nome} onChange={this.atualizaNome} />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control type="email" placeholder="Digite seu email" value={this.state.Email} onChange={this.atualizaEmail} />
                                <Form.Text className="text-muted">
                                    Utilize o seu melhor email.
                                </Form.Text>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.fecharModal}>
                            Fechar
                        </Button>
                        <Button variant="primary" onClick={this.handleSubmitButtonClick}>
                            Salvar
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Button variant="success" onClick={this.reset}>
                    Novo
                </Button>

                {this.renderTabela()}
            </div>
        )
    }
}

export default Usuarios;
