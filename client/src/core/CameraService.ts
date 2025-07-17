/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

export class CameraService {
	private static instance: CameraService;
	private static cameraStream: MediaStream;

	static getInstance() {
		CameraService.instance ??= new CameraService();
		return CameraService.instance;
	}

	async start(settings: MediaStreamConstraints) {
		try {
			CameraService.cameraStream =
				await navigator.mediaDevices.getUserMedia(settings);
			return CameraService.cameraStream;
		} catch (e) {
			console.error(e);
		}
	}

	render(target: HTMLVideoElement) {
		target.srcObject = CameraService.cameraStream;
	}
}

export const cameraService = CameraService.getInstance();
