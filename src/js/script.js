import gsap from 'gsap'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'

window.addEventListener(
	'DOMContentLoaded',
	() => {
		const app = new App3()
		app.init()
		app.render()
	},
	false
)

class App3 {
	static get CAMERA_PARAM() {
		return {
			fovy: 45,
			aspect: window.innerWidth / window.innerHeight,
			near: 0.1,
			far: 100.0,
			x: 10.0,
			y: 6.0,
			z: 10.0,
			lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
		}
	}

	static get RENDERER_PARAM() {
		return {
			clearColor: 0xf7f6f5,
			width: window.innerWidth,
			height: window.innerHeight,
		}
	}

	static get DIRECTIONAL_LIGHT_PARAM() {
		return {
			color: 0xffffff,
			intensity: 0.8,
			x: 10.0,
			y: 30.0,
			z: -10.0,
		}
	}

	static get AMBIENT_LIGHT_PARAM() {
		return {
			color: 0xffffff,
			intensity: 0.2,
		}
	}

	static get MATERIAL_PARAM() {
		return {
			color: 0x00ffff,
		}
	}

	/**
	 * コンストラクタ
	 * @constructor
	 */
	constructor() {
		this.renderer
		this.scene
		this.camera
		this.directionalLight
		this.ambientLight
		this.material
		this.controls
		this.axesHelper
		this.gui

		this.stage

		this.boxes = []
		this.boxGridSize = 10
		this.boxCount = this.boxGridSize ** 2
		this.boxSpasing = 2
		this.boxWaveHeight = 0.5

		this.isAnimating = false // boxがアニメーション中かどうか

		this.render = this.render.bind(this)

		window.addEventListener('keydown', this.handleKeydown.bind(this), false)

		// リサイズイベント
		window.addEventListener(
			'resize',
			() => {
				this.renderer.setSize(window.innerWidth, window.innerHeight)
				this.camera.aspect = window.innerWidth / window.innerHeight
				this.camera.updateProjectionMatrix()
			},
			false
		)
	}

	init() {
		// レンダラー
		this.renderer = new THREE.WebGLRenderer()
		this.renderer.setClearColor(new THREE.Color(App3.RENDERER_PARAM.clearColor))
		this.renderer.setSize(App3.RENDERER_PARAM.width, App3.RENDERER_PARAM.height)
		const wrapper = document.querySelector('#webgl')
		wrapper.appendChild(this.renderer.domElement)

		// シーン
		this.scene = new THREE.Scene()

		// カメラ
		this.camera = new THREE.PerspectiveCamera(
			App3.CAMERA_PARAM.fovy,
			App3.CAMERA_PARAM.aspect,
			App3.CAMERA_PARAM.near,
			App3.CAMERA_PARAM.far
		)
		this.camera.position.set(
			App3.CAMERA_PARAM.x,
			App3.CAMERA_PARAM.y,
			App3.CAMERA_PARAM.z
		)
		this.camera.lookAt(App3.CAMERA_PARAM.lookAt)

		// ディレクショナルライト（平行光源）
		this.directionalLight = new THREE.DirectionalLight(
			App3.DIRECTIONAL_LIGHT_PARAM.color,
			App3.DIRECTIONAL_LIGHT_PARAM.intensity
		)
		this.directionalLight.position.set(
			App3.DIRECTIONAL_LIGHT_PARAM.x,
			App3.DIRECTIONAL_LIGHT_PARAM.y,
			App3.DIRECTIONAL_LIGHT_PARAM.z
		)
		this.scene.add(this.directionalLight)

		// アンビエントライト（環境光）
		this.ambientLight = new THREE.AmbientLight(
			App3.AMBIENT_LIGHT_PARAM.color,
			App3.AMBIENT_LIGHT_PARAM.intensity
		)
		this.scene.add(this.ambientLight)

		// コントロール
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)

		// メッシュ生成
		this.createBoxes()

		// GUI
		this.setGui()

		// ヘルパー
		const axesBarLength = 5.0
		this.axesHelper = new THREE.AxesHelper(axesBarLength)
		// this.scene.add(this.axesHelper)
	}

	createBoxes() {
		this.boxGeometry = new THREE.BoxGeometry(1.0, 1.0, 1.0)

		for (let col = 0; col < this.boxGridSize; col++) {
			for (let row = 0; row < this.boxGridSize; row++) {
				const index = col * this.boxGridSize + row

				// ボックスの色設定
				const colorIntensity = index / (this.boxCount - 1)
				const color = new THREE.Color(App3.MATERIAL_PARAM.color)
				color.lerp(new THREE.Color(0xf5f5f5), colorIntensity)

				const material = new THREE.MeshToonMaterial({ color: color })

				const box = new THREE.Mesh(this.boxGeometry, material)
				box.position.x = row * this.boxSpasing - ((this.boxGridSize - 1) * this.boxSpasing) / 2
				box.position.z = col * this.boxSpasing - ((this.boxGridSize - 1) * this.boxSpasing) / 2
				this.scene.add(box)
				this.boxes.push(box)
			}
		}
	}

	handleKeydown(keyEvent) {
		if (keyEvent.key === ' ') {
			this.animateBoxRotation()
		}
	}

	animateBoxRotation() {
		if (this.isAnimating || !this.boxes.length) return
		
		this.isAnimating = true
		const boxRotations = this.boxes.map(box => box.rotation)
		gsap.to(boxRotations, {
			x: '+=' + Math.PI * 2,
			z: '-=' + Math.PI * 2,
			duration: 1.2,
			stagger: {
				each: 0.2,
				grid: [this.boxGridSize, this.boxGridSize],
			},
			onComplete: () => {
				this.isAnimating = false
			},
		})
	}

	setGui() {
		this.gui = new GUI()
		const param = {
			boxBaseColor: 0x00ffff,
			rotate: this.animateBoxRotation.bind(this)
		}
		this.gui
			.addColor(param, 'boxBaseColor')
			.name('boxBaseColor')
			.onChange((value) => {
				for (let i = 0; i < this.boxes.length; i++) {
					const box = this.boxes[i]
					const colorIntensity = i / (this.boxCount - 1)
					const color = new THREE.Color(value)
					color.lerp(new THREE.Color(0xffffff), colorIntensity)
					box.material.color.set(color)
				}
			})
		this.gui.add( param, 'rotate' )
	}

	/**
	 * 描画処理
	 */
	render() {
		requestAnimationFrame(this.render)

		this.controls.update()

		const time = performance.now() * 0.001

		// wave animation
		for (var i = 0; i < this.boxes.length; i++) {
			const box = this.boxes[i]

			const row = Math.floor(i / this.boxGridSize)
			const col = i % this.boxGridSize
			box.position.y =  Math.sin(time + col * 0.5) * Math.sin(time + row * 0.5) * this.boxWaveHeight
		}

		this.renderer.render(this.scene, this.camera)
	}
}
