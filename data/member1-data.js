/* FILE OWNER: Member 1 — others do not edit */

window.MEMBER1_DATA = {
  name: 'Haziq bin Shahmen',
  about: { 
    role: 'Frontend Developer', 
    education: 'BSc Computer Graphics and Multimedia, UTM', 
    interests: 'Web3, Image Processing, UI/UX', 
    achievements: [
      "Dean's List 2023",
      "Hackathon 2025 Winner"
    ]
  },
  skills: [
    { name: 'JavaScript', category: 'Programming', level: 0.8 },
    { name: 'Three.js', category: 'Graphics', level: 0.85 },
    { name: 'React', category: 'Frontend', level: 0.88 },
    { name: 'UI Design', category: 'Design', level: 0.74 },
    { name: 'Node.js', category: 'Backend', level: 0.62 }
  ],
  projects: [
    { title: 'Butterfly vs Owl Classifier', description: 'A convolutional neural network (CNN) image classification model built with TensorFlow and Keras, trained on a dataset of butterfly and owl images. The model achieves 92% accuracy and was validated using WEKA\'s machine learning evaluation suite. This project involved extensive data augmentation, transfer learning with MobileNetV2, and hyperparameter tuning to optimise performance across two distinct frameworks.', tech: ['TensorFlow', 'Keras', 'WEKA'], mediaSrc: 'https://picsum.photos/400/300?random=1' },
    { title: 'PulseForge Product Page', description: 'An immersive, interactive 3D product landing page built with React Three Fiber and Vite, designed to showcase a conceptual wireless earbud product. Features include auto-rotating 3D models, scroll-driven animations, reflective surfaces, and a glass-morphism UI that adapts to user interactions. This project demonstrates advanced 3D web development techniques for e-commerce product presentation.', tech: ['React Three Fiber', 'Vite'], mediaSrc: 'https://picsum.photos/400/300?random=2' },
    { title: 'Smart Presentation Evaluator', description: 'A computer vision and AI system that automatically evaluates academic presentations. Uses OpenCV for facial expression analysis, MediaPipe for gesture tracking, Whisper for speech-to-text transcription, and SBERT for semantic coherence scoring. The system provides real-time feedback on presentation delivery, including eye contact, vocal clarity, and content structure.', tech: ['OpenCV', 'MediaPipe', 'Whisper', 'SBERT'], mediaSrc: 'https://picsum.photos/400/300?random=3' }
  ]
};
