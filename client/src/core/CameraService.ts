/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

/**
 * ブラウザ上でカメラを扱うためのサービスクラス
 */
export class CameraService {
	private static instance: CameraService;
	private static cameraStream: MediaStream;

	/**
	 * CameraServiceのインスタンスを取得
	 * @returns CameraServiceのインスタンス
	 */
	static getInstance() {
		CameraService.instance ??= new CameraService();
		return CameraService.instance;
	}

	/**
	 * Webカメラの初期設定をする
	 * @param settings Webカメラ使用時の設定
	 * @returns MediaStreamオブジェクト
	 */
	async start(settings: MediaStreamConstraints) {
		try {
			CameraService.cameraStream =
				await navigator.mediaDevices.getUserMedia(settings);
			return CameraService.cameraStream;
		} catch (e) {
			console.error(e);
		}
	}

	/**
	 * Webカメラの映像を描画する
	 * @param target Webカメラの映像の描画先
	 */
	render(target: HTMLVideoElement) {
		target.srcObject = CameraService.cameraStream;
	}
}

export const cameraService = CameraService.getInstance();
