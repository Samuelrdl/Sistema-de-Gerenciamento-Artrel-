from flask import Blueprint, jsonify, request
from src.models.user import FerramentaEPI, AtribuicaoFerramentaEPI, Eletricista, db
from src.routes.auth import require_auth, require_admin
from datetime import datetime

ferramenta_epi_bp = Blueprint('ferramenta_epi', __name__)

@ferramenta_epi_bp.route('/ferramentas-epis', methods=['GET'])
@require_auth
def get_ferramentas_epis():
    ferramentas_epis = FerramentaEPI.query.all()
    return jsonify([item.to_dict() for item in ferramentas_epis])

@ferramenta_epi_bp.route('/ferramentas-epis', methods=['POST'])
@require_admin
def create_ferramenta_epi():
    data = request.json
    nome = data.get('nome')
    tipo = data.get('tipo')
    
    if not nome or not tipo:
        return jsonify({'error': 'Nome e tipo são obrigatórios'}), 400
    
    if tipo not in ['Ferramenta', 'EPI']:
        return jsonify({'error': 'Tipo deve ser Ferramenta ou EPI'}), 400
    
    ferramenta_epi = FerramentaEPI(nome=nome, tipo=tipo)
    db.session.add(ferramenta_epi)
    db.session.commit()
    
    return jsonify(ferramenta_epi.to_dict()), 201

@ferramenta_epi_bp.route('/ferramentas-epis/<int:item_id>', methods=['GET'])
@require_auth
def get_ferramenta_epi(item_id):
    item = FerramentaEPI.query.get_or_404(item_id)
    return jsonify(item.to_dict())

@ferramenta_epi_bp.route('/ferramentas-epis/<int:item_id>', methods=['PUT'])
@require_admin
def update_ferramenta_epi(item_id):
    item = FerramentaEPI.query.get_or_404(item_id)
    data = request.json
    
    nome = data.get('nome')
    tipo = data.get('tipo')
    
    if nome:
        item.nome = nome
    if tipo and tipo in ['Ferramenta', 'EPI']:
        item.tipo = tipo
    
    db.session.commit()
    return jsonify(item.to_dict())

@ferramenta_epi_bp.route('/ferramentas-epis/<int:item_id>', methods=['DELETE'])
@require_admin
def delete_ferramenta_epi(item_id):
    item = FerramentaEPI.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return '', 204

# Rotas para atribuições
@ferramenta_epi_bp.route('/atribuicoes', methods=['GET'])
@require_auth
def get_atribuicoes():
    atribuicoes = AtribuicaoFerramentaEPI.query.all()
    return jsonify([atribuicao.to_dict() for atribuicao in atribuicoes])

@ferramenta_epi_bp.route('/atribuicoes', methods=['POST'])
@require_auth
def create_atribuicao():
    data = request.json
    eletricista_id = data.get('eletricista_id')
    ferramenta_epi_id = data.get('ferramenta_epi_id')
    observacao = data.get('observacao', '')
    
    if not eletricista_id or not ferramenta_epi_id:
        return jsonify({'error': 'Eletricista e ferramenta/EPI são obrigatórios'}), 400
    
    # Verificar se o eletricista existe
    eletricista = Eletricista.query.get(eletricista_id)
    if not eletricista:
        return jsonify({'error': 'Eletricista não encontrado'}), 404
    
    # Verificar se a ferramenta/EPI existe
    ferramenta_epi = FerramentaEPI.query.get(ferramenta_epi_id)
    if not ferramenta_epi:
        return jsonify({'error': 'Ferramenta/EPI não encontrado'}), 404
    
    # Verificar se já existe uma atribuição ativa (sem devolução)
    atribuicao_ativa = AtribuicaoFerramentaEPI.query.filter_by(
        ferramenta_epi_id=ferramenta_epi_id,
        data_devolucao=None
    ).first()
    
    if atribuicao_ativa:
        return jsonify({'error': 'Esta ferramenta/EPI já está atribuída a outro eletricista'}), 400
    
    atribuicao = AtribuicaoFerramentaEPI(
        eletricista_id=eletricista_id,
        ferramenta_epi_id=ferramenta_epi_id,
        observacao=observacao
    )
    
    db.session.add(atribuicao)
    db.session.commit()
    
    return jsonify(atribuicao.to_dict()), 201

@ferramenta_epi_bp.route('/atribuicoes/<int:atribuicao_id>/devolver', methods=['PUT'])
@require_auth
def devolver_atribuicao(atribuicao_id):
    atribuicao = AtribuicaoFerramentaEPI.query.get_or_404(atribuicao_id)
    
    if atribuicao.data_devolucao:
        return jsonify({'error': 'Esta atribuição já foi devolvida'}), 400
    
    data = request.json
    observacao = data.get('observacao', atribuicao.observacao)
    
    atribuicao.data_devolucao = datetime.utcnow()
    atribuicao.observacao = observacao
    
    db.session.commit()
    
    return jsonify(atribuicao.to_dict())

@ferramenta_epi_bp.route('/atribuicoes/<int:atribuicao_id>', methods=['GET'])
@require_auth
def get_atribuicao(atribuicao_id):
    atribuicao = AtribuicaoFerramentaEPI.query.get_or_404(atribuicao_id)
    return jsonify(atribuicao.to_dict())

