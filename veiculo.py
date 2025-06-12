from flask import Blueprint, jsonify, request, session
from src.models.user import (Veiculo, ServicoExterno, MaterialServicoExterno, 
                            ChecklistCinto, ChecklistEscada, User, db)
from src.routes.auth import require_auth, require_admin
from datetime import datetime

veiculo_bp = Blueprint('veiculo', __name__)

# Rotas para veículos
@veiculo_bp.route('/veiculos', methods=['GET'])
@require_auth
def get_veiculos():
    veiculos = Veiculo.query.all()
    return jsonify([veiculo.to_dict() for veiculo in veiculos])

@veiculo_bp.route('/veiculos', methods=['POST'])
@require_admin
def create_veiculo():
    data = request.json
    identificacao = data.get('identificacao')
    
    if not identificacao:
        return jsonify({'error': 'Identificação é obrigatória'}), 400
    
    # Verificar se já existe um veículo com esta identificação
    veiculo_existente = Veiculo.query.filter_by(identificacao=identificacao).first()
    if veiculo_existente:
        return jsonify({'error': 'Já existe um veículo com esta identificação'}), 400
    
    veiculo = Veiculo(identificacao=identificacao)
    db.session.add(veiculo)
    db.session.commit()
    
    return jsonify(veiculo.to_dict()), 201

@veiculo_bp.route('/veiculos/<int:veiculo_id>', methods=['GET'])
@require_auth
def get_veiculo(veiculo_id):
    veiculo = Veiculo.query.get_or_404(veiculo_id)
    return jsonify(veiculo.to_dict())

@veiculo_bp.route('/veiculos/<int:veiculo_id>', methods=['PUT'])
@require_admin
def update_veiculo(veiculo_id):
    veiculo = Veiculo.query.get_or_404(veiculo_id)
    data = request.json
    
    identificacao = data.get('identificacao')
    if identificacao:
        # Verificar se já existe outro veículo com esta identificação
        veiculo_existente = Veiculo.query.filter_by(identificacao=identificacao).filter(Veiculo.id != veiculo_id).first()
        if veiculo_existente:
            return jsonify({'error': 'Já existe um veículo com esta identificação'}), 400
        veiculo.identificacao = identificacao
    
    db.session.commit()
    return jsonify(veiculo.to_dict())

@veiculo_bp.route('/veiculos/<int:veiculo_id>', methods=['DELETE'])
@require_admin
def delete_veiculo(veiculo_id):
    veiculo = Veiculo.query.get_or_404(veiculo_id)
    db.session.delete(veiculo)
    db.session.commit()
    return '', 204

# Rotas para serviços externos
@veiculo_bp.route('/servicos-externos', methods=['GET'])
@require_auth
def get_servicos_externos():
    servicos = ServicoExterno.query.all()
    result = []
    for servico in servicos:
        servico_dict = servico.to_dict()
        # Incluir materiais, checklist cinto e checklist escada
        servico_dict['materiais'] = [material.to_dict() for material in servico.materiais]
        if servico.checklist_cinto:
            servico_dict['checklist_cinto'] = servico.checklist_cinto.to_dict()
        if servico.checklist_escada:
            servico_dict['checklist_escada'] = servico.checklist_escada.to_dict()
        result.append(servico_dict)
    return jsonify(result)

@veiculo_bp.route('/servicos-externos', methods=['POST'])
@require_auth
def create_servico_externo():
    data = request.json
    veiculo_id = data.get('veiculo_id')
    destino = data.get('destino')
    empresa_atendida = data.get('empresa_atendida')
    materiais = data.get('materiais', [])
    checklist_cinto = data.get('checklist_cinto', {})
    checklist_escada = data.get('checklist_escada', {})
    
    if not veiculo_id or not destino or not empresa_atendida:
        return jsonify({'error': 'Veículo, destino e empresa atendida são obrigatórios'}), 400
    
    # Verificar se o veículo existe
    veiculo = Veiculo.query.get(veiculo_id)
    if not veiculo:
        return jsonify({'error': 'Veículo não encontrado'}), 404
    
    # Criar serviço externo
    servico = ServicoExterno(
        colaborador_id=session['user_id'],
        veiculo_id=veiculo_id,
        destino=destino,
        empresa_atendida=empresa_atendida
    )
    
    db.session.add(servico)
    db.session.flush()  # Para obter o ID do serviço
    
    # Criar materiais
    for material_data in materiais:
        material = MaterialServicoExterno(
            servico_externo_id=servico.id,
            nome=material_data.get('nome', ''),
            tipo=material_data.get('tipo', ''),
            status=material_data.get('status', 'B'),
            observacao_tecnica=material_data.get('observacao_tecnica', ''),
            foto_path=material_data.get('foto_path', '')
        )
        db.session.add(material)
    
    # Criar checklist cinto
    if checklist_cinto:
        cinto = ChecklistCinto(
            servico_externo_id=servico.id,
            cinto_seguranca_status=checklist_cinto.get('cinto_seguranca_status', 'B'),
            talabarte_status=checklist_cinto.get('talabarte_status', 'B'),
            mosquetao_status=checklist_cinto.get('mosquetao_status', 'B'),
            observacoes=checklist_cinto.get('observacoes', '')
        )
        db.session.add(cinto)
    
    # Criar checklist escada
    if checklist_escada:
        escada = ChecklistEscada(
            servico_externo_id=servico.id,
            escada_simples_status=checklist_escada.get('escada_simples_status', 'B'),
            escada_extensivel_status=checklist_escada.get('escada_extensivel_status', 'B'),
            degraus_status=checklist_escada.get('degraus_status', 'B'),
            travas_status=checklist_escada.get('travas_status', 'B'),
            observacoes=checklist_escada.get('observacoes', '')
        )
        db.session.add(escada)
    
    db.session.commit()
    
    return jsonify(servico.to_dict()), 201

@veiculo_bp.route('/servicos-externos/<int:servico_id>', methods=['GET'])
@require_auth
def get_servico_externo(servico_id):
    servico = ServicoExterno.query.get_or_404(servico_id)
    servico_dict = servico.to_dict()
    
    # Incluir materiais, checklist cinto e checklist escada
    servico_dict['materiais'] = [material.to_dict() for material in servico.materiais]
    if servico.checklist_cinto:
        servico_dict['checklist_cinto'] = servico.checklist_cinto.to_dict()
    if servico.checklist_escada:
        servico_dict['checklist_escada'] = servico.checklist_escada.to_dict()
    
    return jsonify(servico_dict)

@veiculo_bp.route('/servicos-externos/<int:servico_id>', methods=['PUT'])
@require_auth
def update_servico_externo(servico_id):
    servico = ServicoExterno.query.get_or_404(servico_id)
    data = request.json
    
    # Atualizar campos básicos
    if 'destino' in data:
        servico.destino = data['destino']
    if 'empresa_atendida' in data:
        servico.empresa_atendida = data['empresa_atendida']
    if 'veiculo_id' in data:
        veiculo = Veiculo.query.get(data['veiculo_id'])
        if not veiculo:
            return jsonify({'error': 'Veículo não encontrado'}), 404
        servico.veiculo_id = data['veiculo_id']
    
    # Atualizar materiais se fornecidos
    if 'materiais' in data:
        # Remover materiais existentes
        MaterialServicoExterno.query.filter_by(servico_externo_id=servico.id).delete()
        
        # Adicionar novos materiais
        for material_data in data['materiais']:
            material = MaterialServicoExterno(
                servico_externo_id=servico.id,
                nome=material_data.get('nome', ''),
                tipo=material_data.get('tipo', ''),
                status=material_data.get('status', 'B'),
                observacao_tecnica=material_data.get('observacao_tecnica', ''),
                foto_path=material_data.get('foto_path', '')
            )
            db.session.add(material)
    
    # Atualizar checklist cinto se fornecido
    if 'checklist_cinto' in data:
        checklist_data = data['checklist_cinto']
        if servico.checklist_cinto:
            servico.checklist_cinto.cinto_seguranca_status = checklist_data.get('cinto_seguranca_status', servico.checklist_cinto.cinto_seguranca_status)
            servico.checklist_cinto.talabarte_status = checklist_data.get('talabarte_status', servico.checklist_cinto.talabarte_status)
            servico.checklist_cinto.mosquetao_status = checklist_data.get('mosquetao_status', servico.checklist_cinto.mosquetao_status)
            servico.checklist_cinto.observacoes = checklist_data.get('observacoes', servico.checklist_cinto.observacoes)
        else:
            cinto = ChecklistCinto(
                servico_externo_id=servico.id,
                cinto_seguranca_status=checklist_data.get('cinto_seguranca_status', 'B'),
                talabarte_status=checklist_data.get('talabarte_status', 'B'),
                mosquetao_status=checklist_data.get('mosquetao_status', 'B'),
                observacoes=checklist_data.get('observacoes', '')
            )
            db.session.add(cinto)
    
    # Atualizar checklist escada se fornecido
    if 'checklist_escada' in data:
        checklist_data = data['checklist_escada']
        if servico.checklist_escada:
            servico.checklist_escada.escada_simples_status = checklist_data.get('escada_simples_status', servico.checklist_escada.escada_simples_status)
            servico.checklist_escada.escada_extensivel_status = checklist_data.get('escada_extensivel_status', servico.checklist_escada.escada_extensivel_status)
            servico.checklist_escada.degraus_status = checklist_data.get('degraus_status', servico.checklist_escada.degraus_status)
            servico.checklist_escada.travas_status = checklist_data.get('travas_status', servico.checklist_escada.travas_status)
            servico.checklist_escada.observacoes = checklist_data.get('observacoes', servico.checklist_escada.observacoes)
        else:
            escada = ChecklistEscada(
                servico_externo_id=servico.id,
                escada_simples_status=checklist_data.get('escada_simples_status', 'B'),
                escada_extensivel_status=checklist_data.get('escada_extensivel_status', 'B'),
                degraus_status=checklist_data.get('degraus_status', 'B'),
                travas_status=checklist_data.get('travas_status', 'B'),
                observacoes=checklist_data.get('observacoes', '')
            )
            db.session.add(escada)
    
    db.session.commit()
    return jsonify(servico.to_dict())

@veiculo_bp.route('/servicos-externos/<int:servico_id>', methods=['DELETE'])
@require_admin
def delete_servico_externo(servico_id):
    servico = ServicoExterno.query.get_or_404(servico_id)
    db.session.delete(servico)
    db.session.commit()
    return '', 204

