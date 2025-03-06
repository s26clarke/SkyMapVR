import os
import ssl
from http.server import SimpleHTTPRequestHandler, HTTPServer

# Custom handler to add Cache-Control headers
class CustomHTTPRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add Cache-Control header before sending response headers
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        super().end_headers()  # Call the parent method to send other headers

def generate_cert():
    from cryptography import x509
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.backends import default_backend
    from cryptography.x509.oid import NameOID
    import datetime

    cert_dir = "certs"
    os.makedirs(cert_dir, exist_ok=True)  # Ensure the directory exists

    # Generate RSA key
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )

    # Generate a self-signed certificate
    subject = issuer = x509.Name([x509.NameAttribute(NameOID.COUNTRY_NAME, u"US"),
                                  x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, u"California"),
                                  x509.NameAttribute(NameOID.LOCALITY_NAME, u"San Francisco"),
                                  x509.NameAttribute(NameOID.ORGANIZATION_NAME, u"Python HTTPS Example"),
                                  x509.NameAttribute(NameOID.COMMON_NAME, u"localhost"),
                                  ])
    cert = x509.CertificateBuilder().subject_name(subject).issuer_name(issuer).public_key(
        private_key.public_key()).serial_number(x509.random_serial_number()).not_valid_before(
        datetime.datetime.utcnow()).not_valid_after(
        datetime.datetime.utcnow() + datetime.timedelta(days=365)).add_extension(
        x509.SubjectAlternativeName([x509.DNSName(u"localhost")]), critical=False).sign(private_key, hashes.SHA256(),
                                                                                          default_backend())

    # Save private key and certificate to files in the certs/ directory
    key_path = os.path.join(cert_dir, "key.pem")
    cert_path = os.path.join(cert_dir, "cert.pem")

    with open(key_path, "wb") as f:
        f.write(private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        ))
    with open(cert_path, "wb") as f:
        f.write(cert.public_bytes(serialization.Encoding.PEM))

    print(f"Generated {key_path} and {cert_path}")

generate_cert()

# Create an HTTPS server with the custom request handler
httpd = HTTPServer(('0.0.0.0', 8000), CustomHTTPRequestHandler)

httpd.socket = ssl.wrap_socket(
    httpd.socket,
    keyfile="certs/key.pem",
    certfile="certs/cert.pem",
    server_side=True
)

print("Serving HTTPS on https://localhost:8000")
httpd.serve_forever()
