import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db, User, Eletricista, FerramentaEPI, Veiculo
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.eletricista import eletricista_bp
from src.routes.ferramenta_epi import ferramenta_epi_bp
from src.routes.veiculo import veiculo_bp
from src.routes.export import export_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Configurar CORS para permitir requisições do frontend
CORS(app, supports_credentials=True)

# Registrar blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(eletricista_bp, url_prefix='/api')
app.register_blueprint(ferramenta_epi_bp, url_prefix='/api')
app.register_blueprint(veiculo_bp, url_prefix='/api')
app.register_blueprint(export_bp, url_prefix='/api')

# uncomment if you need to use database
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def create_default_data():
    """Cria dados padrão no banco de dados"""
    # Criar usuário admin padrão
    admin_user = User.query.filter_by(username='admin').first()
    if not admin_user:
        admin_user = User(username='admin', permissao='admin')
        admin_user.set_password('admin123')
        db.session.add(admin_user)
    
    # Criar ferramentas padrão
    ferramentas_padrao = [
        'Alicate Universal', 'Chave de Fenda', 'Chave Phillips', 'Multímetro', 
        'Alicate Amperímetro', 'Furadeira', 'Parafusadeira', 'Morsa', 'Martelo', 'Chave Inglesa'
    ]
    
    for nome in ferramentas_padrao:
        ferramenta = FerramentaEPI.query.filter_by(nome=nome, tipo='Ferramenta').first()
        if not ferramenta:
            ferramenta = FerramentaEPI(nome=nome, tipo='Ferramenta')
            db.session.add(ferramenta)
    
    # Criar EPIs padrão
    epis_padrao = [
        'Capacete de Segurança', 'Óculos de Proteção', 'Luvas Isolantes', 'Botina de Segurança',
        'Cinto de Segurança', 'Talabarte', 'Uniforme NR-10', 'Protetor Auricular', 
        'Máscara de Proteção', 'Detector de Tensão'
    ]
    
    for nome in epis_padrao:
        epi = FerramentaEPI.query.filter_by(nome=nome, tipo='EPI').first()
        if not epi:
            epi = FerramentaEPI(nome=nome, tipo='EPI')
            db.session.add(epi)
    
    # Criar veículos padrão
    veiculos_padrao = ['VAN-001', 'VAN-002', 'CAMINHÃO-001', 'PICKUP-001', 'UTILITÁRIO-001']
    
    for identificacao in veiculos_padrao:
        veiculo = Veiculo.query.filter_by(identificacao=identificacao).first()
        if not veiculo:
            veiculo = Veiculo(identificacao=identificacao)
            db.session.add(veiculo)
    
    db.session.commit()

with app.app_context():
    db.create_all()
    create_default_data()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)

