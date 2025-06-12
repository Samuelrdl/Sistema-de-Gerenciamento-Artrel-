from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    permissao = db.Column(db.String(20), nullable=False, default='colaborador')  # admin ou colaborador
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'permissao': self.permissao,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None
        }

class Eletricista(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)

    # Relacionamentos
    atribuicoes = db.relationship('AtribuicaoFerramentaEPI', backref='eletricista', lazy=True)

    def __repr__(self):
        return f'<Eletricista {self.nome}>'

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None
        }

class FerramentaEPI(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(20), nullable=False)  # Ferramenta ou EPI
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)

    # Relacionamentos
    atribuicoes = db.relationship('AtribuicaoFerramentaEPI', backref='ferramenta_epi', lazy=True)

    def __repr__(self):
        return f'<{self.tipo} {self.nome}>'

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'tipo': self.tipo,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None
        }

class AtribuicaoFerramentaEPI(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    eletricista_id = db.Column(db.Integer, db.ForeignKey('eletricista.id'), nullable=False)
    ferramenta_epi_id = db.Column(db.Integer, db.ForeignKey('ferramenta_epi.id'), nullable=False)
    data_retirada = db.Column(db.DateTime, default=datetime.utcnow)
    data_devolucao = db.Column(db.DateTime, nullable=True)
    observacao = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f'<Atribuicao {self.eletricista_id}-{self.ferramenta_epi_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'eletricista_id': self.eletricista_id,
            'ferramenta_epi_id': self.ferramenta_epi_id,
            'data_retirada': self.data_retirada.isoformat() if self.data_retirada else None,
            'data_devolucao': self.data_devolucao.isoformat() if self.data_devolucao else None,
            'observacao': self.observacao,
            'eletricista_nome': self.eletricista.nome if self.eletricista else None,
            'ferramenta_epi_nome': self.ferramenta_epi.nome if self.ferramenta_epi else None,
            'ferramenta_epi_tipo': self.ferramenta_epi.tipo if self.ferramenta_epi else None
        }

class Veiculo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    identificacao = db.Column(db.String(50), unique=True, nullable=False)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)

    # Relacionamentos
    servicos_externos = db.relationship('ServicoExterno', backref='veiculo', lazy=True)

    def __repr__(self):
        return f'<Veiculo {self.identificacao}>'

    def to_dict(self):
        return {
            'id': self.id,
            'identificacao': self.identificacao,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None
        }

class ServicoExterno(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    colaborador_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    veiculo_id = db.Column(db.Integer, db.ForeignKey('veiculo.id'), nullable=False)
    destino = db.Column(db.String(200), nullable=False)
    empresa_atendida = db.Column(db.String(200), nullable=False)
    data_hora_saida = db.Column(db.DateTime, default=datetime.utcnow)

    # Relacionamentos
    colaborador = db.relationship('User', backref='servicos_externos')
    materiais = db.relationship('MaterialServicoExterno', backref='servico_externo', lazy=True, cascade='all, delete-orphan')
    checklist_cinto = db.relationship('ChecklistCinto', backref='servico_externo', uselist=False, cascade='all, delete-orphan')
    checklist_escada = db.relationship('ChecklistEscada', backref='servico_externo', uselist=False, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<ServicoExterno {self.destino}>'

    def to_dict(self):
        return {
            'id': self.id,
            'colaborador_id': self.colaborador_id,
            'veiculo_id': self.veiculo_id,
            'destino': self.destino,
            'empresa_atendida': self.empresa_atendida,
            'data_hora_saida': self.data_hora_saida.isoformat() if self.data_hora_saida else None,
            'colaborador_nome': self.colaborador.username if self.colaborador else None,
            'veiculo_identificacao': self.veiculo.identificacao if self.veiculo else None
        }

class MaterialServicoExterno(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    servico_externo_id = db.Column(db.Integer, db.ForeignKey('servico_externo.id'), nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(1), nullable=False)  # B/I/N/A
    observacao_tecnica = db.Column(db.Text, nullable=True)
    foto_path = db.Column(db.String(255), nullable=True)

    def __repr__(self):
        return f'<Material {self.nome}>'

    def to_dict(self):
        return {
            'id': self.id,
            'servico_externo_id': self.servico_externo_id,
            'nome': self.nome,
            'tipo': self.tipo,
            'status': self.status,
            'observacao_tecnica': self.observacao_tecnica,
            'foto_path': self.foto_path
        }

class ChecklistCinto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    servico_externo_id = db.Column(db.Integer, db.ForeignKey('servico_externo.id'), nullable=False)
    cinto_seguranca_status = db.Column(db.String(1), nullable=False)  # B/I/N/A
    talabarte_status = db.Column(db.String(1), nullable=False)  # B/I/N/A
    mosquetao_status = db.Column(db.String(1), nullable=False)  # B/I/N/A
    observacoes = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f'<ChecklistCinto {self.servico_externo_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'servico_externo_id': self.servico_externo_id,
            'cinto_seguranca_status': self.cinto_seguranca_status,
            'talabarte_status': self.talabarte_status,
            'mosquetao_status': self.mosquetao_status,
            'observacoes': self.observacoes
        }

class ChecklistEscada(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    servico_externo_id = db.Column(db.Integer, db.ForeignKey('servico_externo.id'), nullable=False)
    escada_simples_status = db.Column(db.String(1), nullable=False)  # B/I/N/A
    escada_extensivel_status = db.Column(db.String(1), nullable=False)  # B/I/N/A
    degraus_status = db.Column(db.String(1), nullable=False)  # B/I/N/A
    travas_status = db.Column(db.String(1), nullable=False)  # B/I/N/A
    observacoes = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f'<ChecklistEscada {self.servico_externo_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'servico_externo_id': self.servico_externo_id,
            'escada_simples_status': self.escada_simples_status,
            'escada_extensivel_status': self.escada_extensivel_status,
            'degraus_status': self.degraus_status,
            'travas_status': self.travas_status,
            'observacoes': self.observacoes
        }

