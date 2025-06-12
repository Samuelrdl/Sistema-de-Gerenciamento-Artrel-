from flask import Blueprint, jsonify, request
from src.models.user import Eletricista, db
from src.routes.auth import require_auth, require_admin

eletricista_bp = Blueprint('eletricista', __name__)

@eletricista_bp.route('/eletricistas', methods=['GET'])
@require_auth
def get_eletricistas():
    eletricistas = Eletricista.query.all()
    return jsonify([eletricista.to_dict() for eletricista in eletricistas])

@eletricista_bp.route('/eletricistas', methods=['POST'])
@require_admin
def create_eletricista():
    data = request.json
    nome = data.get('nome')
    
    if not nome:
        return jsonify({'error': 'Nome é obrigatório'}), 400
    
    eletricista = Eletricista(nome=nome)
    db.session.add(eletricista)
    db.session.commit()
    
    return jsonify(eletricista.to_dict()), 201

@eletricista_bp.route('/eletricistas/<int:eletricista_id>', methods=['GET'])
@require_auth
def get_eletricista(eletricista_id):
    eletricista = Eletricista.query.get_or_404(eletricista_id)
    return jsonify(eletricista.to_dict())

@eletricista_bp.route('/eletricistas/<int:eletricista_id>', methods=['PUT'])
@require_admin
def update_eletricista(eletricista_id):
    eletricista = Eletricista.query.get_or_404(eletricista_id)
    data = request.json
    
    nome = data.get('nome')
    if nome:
        eletricista.nome = nome
    
    db.session.commit()
    return jsonify(eletricista.to_dict())

@eletricista_bp.route('/eletricistas/<int:eletricista_id>', methods=['DELETE'])
@require_admin
def delete_eletricista(eletricista_id):
    eletricista = Eletricista.query.get_or_404(eletricista_id)
    db.session.delete(eletricista)
    db.session.commit()
    return '', 204

