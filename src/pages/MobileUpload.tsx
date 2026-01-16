import React, { useState, useRef } from 'react';
import {
	Box,
	Button,
	Typography,
	Paper,
	CircularProgress,
	Alert,
} from '@mui/material';
import { CameraAlt, Upload } from '@mui/icons-material';

const MobileUpload: React.FC = () => {
	const [isCapturing, setIsCapturing] = useState(false);
	const [capturedImage, setCapturedImage] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadSuccess, setUploadSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);
	
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const streamRef = useRef<MediaStream | null>(null);

	// Obter parâmetros da URL
	const urlParams = new URLSearchParams(window.location.search);
	const plane = urlParams.get('plane');
	const session = urlParams.get('session');

	const startCamera = async () => {
		try {
			setError(null);
			const stream = await navigator.mediaDevices.getUserMedia({ 
				video: { 
					facingMode: 'environment', // Usar câmera traseira
					width: { ideal: 1920 },
					height: { ideal: 1080 }
				} 
			});
			
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				streamRef.current = stream;
			}
		} catch (err) {
			setError('Erro ao acessar a câmera. Verifique as permissões.');
			console.error('Erro ao acessar câmera:', err);
		}
	};

	const stopCamera = () => {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach(track => track.stop());
			streamRef.current = null;
		}
		if (videoRef.current) {
			videoRef.current.srcObject = null;
		}
	};

	const capturePhoto = () => {
		if (!videoRef.current || !canvasRef.current) return;

		setIsCapturing(true);
		
		const video = videoRef.current;
		const canvas = canvasRef.current;
		const context = canvas.getContext('2d');

		if (context) {
			// Configurar canvas com as dimensões do vídeo
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			
			// Desenhar o frame atual do vídeo no canvas
			context.drawImage(video, 0, 0, canvas.width, canvas.height);
			
			// Converter para base64
			const imageData = canvas.toDataURL('image/jpeg', 0.8);
			setCapturedImage(imageData);
		}
		
		setIsCapturing(false);
		stopCamera();
	};

	const uploadPhoto = async () => {
		if (!capturedImage || !session) return;

		setIsUploading(true);
		setError(null);

		try {
			// Simular upload - em produção, você enviaria para seu backend
			// Por enquanto, vamos usar localStorage para simular
			localStorage.setItem(`upload_${session}`, capturedImage);
			
			// Aguardar um pouco para simular o upload
			await new Promise(resolve => setTimeout(resolve, 2000));
			
			setUploadSuccess(true);
		} catch (err) {
			setError('Erro ao enviar a foto. Tente novamente.');
			console.error('Erro no upload:', err);
		} finally {
			setIsUploading(false);
		}
	};

	const retakePhoto = () => {
		setCapturedImage(null);
		setUploadSuccess(false);
		setError(null);
		startCamera();
	};

	React.useEffect(() => {
		startCamera();
		
		return () => {
			stopCamera();
		};
	}, []);

	if (!plane || !session) {
		return (
			<Box sx={{ p: 2, textAlign: 'center' }}>
				<Alert severity="error">
					Parâmetros inválidos. Verifique o QR code.
				</Alert>
			</Box>
		);
	}

	if (uploadSuccess) {
		return (
			<Box sx={{ p: 2, textAlign: 'center' }}>
				<Paper sx={{ p: 3, maxWidth: 400, mx: 'auto' }}>
					<Typography variant="h6" color="success.main" gutterBottom>
						✅ Foto enviada com sucesso!
					</Typography>
					<Typography variant="body2" color="text.secondary">
						A foto foi enviada para o sistema. Você pode fechar esta página.
					</Typography>
				</Paper>
			</Box>
		);
	}

	return (
		<Box sx={{ p: 2, maxWidth: 500, mx: 'auto' }}>
			<Paper sx={{ p: 2, mb: 2 }}>
				<Typography variant="h6" gutterBottom>
					📸 Capturar Foto
				</Typography>
				<Typography variant="body2" color="text.secondary" gutterBottom>
					Plano: {plane}
				</Typography>
			</Paper>

			{error && (
				<Alert severity="error" sx={{ mb: 2 }}>
					{error}
				</Alert>
			)}

			{!capturedImage ? (
				<Paper sx={{ p: 2, textAlign: 'center' }}>
					<Box sx={{ position: 'relative', mb: 2 }}>
						<video
							ref={videoRef}
							autoPlay
							playsInline
							muted
							style={{
								width: '100%',
								maxWidth: '400px',
								borderRadius: '8px',
							}}
						/>
						{isCapturing && (
							<Box
								sx={{
									position: 'absolute',
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									bgcolor: 'rgba(0,0,0,0.5)',
									borderRadius: '8px',
								}}
							>
								<CircularProgress />
							</Box>
						)}
					</Box>
					
					<Button
						variant="contained"
						size="large"
						startIcon={<CameraAlt />}
						onClick={capturePhoto}
						disabled={isCapturing}
						sx={{ mb: 2 }}
					>
						Tirar Foto
					</Button>
					
					<Typography variant="body2" color="text.secondary">
						Posicione a câmera e tire a foto do plano {plane}
					</Typography>
				</Paper>
			) : (
				<Paper sx={{ p: 2, textAlign: 'center' }}>
					<Box sx={{ mb: 2 }}>
						<img
							src={capturedImage}
							alt="Foto capturada"
							style={{
								width: '100%',
								maxWidth: '400px',
								borderRadius: '8px',
							}}
						/>
					</Box>
					
					<Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
						<Button
							variant="outlined"
							onClick={retakePhoto}
							disabled={isUploading}
						>
							Tirar Nova Foto
						</Button>
						
						<Button
							variant="contained"
							startIcon={isUploading ? <CircularProgress size={20} /> : <Upload />}
							onClick={uploadPhoto}
							disabled={isUploading}
						>
							{isUploading ? 'Enviando...' : 'Enviar Foto'}
						</Button>
					</Box>
				</Paper>
			)}

			<canvas ref={canvasRef} style={{ display: 'none' }} />
		</Box>
	);
};

export default MobileUpload;
