import {
    Bodies,
    Composite,
    Engine,
    World,
    Runner,
    Render,
    Vector,
    Body,
    Constraint,
    Events
} from "matter-js";

type CompositeObject = (Body | Constraint);
export class RagdollSimulation {
    private canvasParent: HTMLElement;
    private pointerPosition: Vector;
    private isAttached: boolean;

    private engine: Engine;
    private render: Render;
    private runner: Runner;
    private ragdoll: Composite;
    private ragdollObjectStages: CompositeObject[][]
    private ragdollStage: number;

    constructor(canvasParentElement: HTMLElement, objectSize: number = 1.3) {
        this.canvasParent = canvasParentElement;
        this.pointerPosition = Vector.create(0, 0);
        this.isAttached = false;
        
        this.engine = Engine.create({
            gravity: Vector.create(0, 7),
        });

        this.render = Render.create({
            element: this.canvasParent,
            engine: this.engine,
            options: {
                width: this.canvasParent.clientWidth,
                height: this.canvasParent.clientHeight,
                showAngleIndicator: true
            }
        });

        this.runner = Runner.create();
        Runner.run(this.runner, this.engine);

        this.ragdollObjectStages = createRagdollObjectStages(0, 0, objectSize);
        this.ragdoll = Composite.create();
        this.ragdollStage = -1;
        this.nextStage();
        Composite.add(this.engine.world, this.ragdoll);

        Events.on(this.engine, 'afterUpdate', this.onAfterUpdate.bind(this));
        this.onWindowResize();
    }

    get isFinalStage(): boolean {
        return this.ragdollStage === this.ragdollObjectStages.length - 1;
    }

    attach() {
        if (this.isAttached) return; // Can't attach when already attached
        this.isAttached = true;
        Render.run(this.render);
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    detach() {
        if (!this.isAttached) return; // Can't detach when already attached
        this.isAttached = false;
        document.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('resize', this.onWindowResize);
        Render.stop(this.render);
        this.render.canvas.remove();
        this.render.textures = {};
    }

    destroy() {
        this.detach();
        World.clear(this.engine.world, false);
        Engine.clear(this.engine);
        Runner.stop(this.runner);
    }

    private onWindowResize() {
        const rect = document.body.getBoundingClientRect();
        this.render.canvas.width = rect.width * window.devicePixelRatio;
        this.render.canvas.height = rect.height * window.devicePixelRatio;
    }

    private onMouseMove(e: MouseEvent) {
        this.pointerPosition.x = e.clientX;
        this.pointerPosition.y = e.clientY;
    }

    private onAfterUpdate() {
        if (!this.ragdoll) return;
        const handle = this.ragdoll.bodies.find(body => body.label === "handle")!;
        const delta = Vector.add(Vector.sub(this.pointerPosition, handle.position), Vector.create(0, -20));
        const forceToApply = Vector.mult(delta, this.ragdoll.bodies.length * 0.0004);
        Body.applyForce(handle, handle.position, forceToApply);
    }

    nextStage() {
        this.ragdollStage++;
        const objects = this.ragdollObjectStages[this.ragdollStage];
        objects
            .filter(obj => 'position' in obj)
            .forEach(body => Body.setPosition(body, Vector.add(body.position, this.pointerPosition)));

        Composite.add(this.ragdoll, objects);
    }

    resetStages() {
        this.ragdoll.bodies.forEach(body => Composite.remove(this.ragdoll, body));
        this.ragdoll.constraints.forEach(constraint => Composite.remove(this.ragdoll, constraint));
        Composite.add(this.ragdoll, this.ragdollObjectStages[0]);
        this.ragdollStage = 1;
    }
}

function createRagdollObjectStages(x: number, y: number, scale: number = 1): CompositeObject[][] {
    const head = Bodies.rectangle(
        x,
        y - 60 * scale,
        34 * scale,
        40 * scale,
        {
            label: 'head',
            collisionFilter: {
                group: Body.nextGroup(true)
            },
            chamfer: {
                radius: [15 * scale, 15 * scale, 15 * scale, 15 * scale]
            },
            render: {
                fillStyle: '#FFBC42'
            }
        }
    );
    const chest = Bodies.rectangle(
        x,
        y,
        55 * scale,
        80 * scale,
        {
            label: 'chest',
            collisionFilter: {
                group: Body.nextGroup(true)
            },
            chamfer: {
                radius: [20 * scale, 20 * scale, 26 * scale, 26 * scale]
            },
            render: {
                fillStyle: '#E0A423'
            }
        }
    );
    const defaultLimbOptions: Matter.IChamferableBodyDefinition = {
        collisionFilter: {
            group: Body.nextGroup(true)
        },
        chamfer: {
            radius: 10 * scale
        },
        render: {
            fillStyle: '#FFBC42'
        },
        mass: 2
    };

    const handle = Bodies.rectangle(
        x + 39 * scale,
        y + 50 * scale,
        20 * scale,
        20 * scale,
        {
            ...defaultLimbOptions,
            label: 'handle',
            render: {
                visible: false
            },
            mass: 1
        }
    );
    const rightUpperArm = Bodies.rectangle(
        x + 39 * scale,
        y - 15 * scale,
        20 * scale,
        40 * scale,
        {
            ...defaultLimbOptions,
            label: 'right-upper-arm'
        }
    );
    const rightLowerArm = Bodies.rectangle(
        x + 39 * scale,
        y + 25 * scale,
        20 * scale,
        60 * scale,
        {
            ...defaultLimbOptions,
            label: 'right-lower-arm'
        }
    );
    const leftUpperArm = Bodies.rectangle(
        x - 39 * scale,
        y - 15 * scale,
        20 * scale,
        40 * scale,
        {
            ...defaultLimbOptions,
            label: 'left-upper-arm'
        }
    );
    const leftLowerArm = Bodies.rectangle(
        x - 39 * scale,
        y + 25 * scale,
        20 * scale,
        60 * scale,
        {
            ...defaultLimbOptions,
            label: 'left-lower-arm'
        }
    );
    const leftUpperLeg = Bodies.rectangle(
        x - 20 * scale,
        y + 57 * scale,
        20 * scale,
        40 * scale,
        {
            ...defaultLimbOptions,
            label: 'left-upper-leg'
        }
    );
    const leftLowerLeg = Bodies.rectangle(
        x - 20 * scale,
        y + 97 * scale,
        20 * scale,
        60 * scale,
        {
            ...defaultLimbOptions,
            label: 'left-lower-leg'
        }
    );
    const rightUpperLeg = Bodies.rectangle(
        x + 20 * scale,
        y + 57 * scale,
        20 * scale,
        40 * scale,
        {
            ...defaultLimbOptions,
            label: 'right-upper-leg'
        }
    );
    const rightLowerLeg = Bodies.rectangle(
        x + 20 * scale,
        y + 97 * scale,
        20 * scale,
        60 * scale,
        {
            ...defaultLimbOptions,
            label: 'right-lower-leg'
        }
    );
    
    const handleConstraint = Constraint.create({
        bodyA: handle,
        pointA: {
            x: -10 * scale,
            y: 0
        },
        pointB: {
            x: 0,
            y: 20 * scale
        },
        bodyB: rightLowerArm,
        render: {
            visible: false
        },
        stiffness: 1,
        damping: 0
    });
    const chestToRightUpperArm = Constraint.create({
        bodyA: chest,
        pointA: {
            x: 24 * scale,
            y: -23 * scale
        },
        pointB: {
            x: 0,
            y: -8 * scale
        },
        bodyB: rightUpperArm,
        stiffness: 0.6,
        render: {
            visible: false
        }
    });
    const chestToLeftUpperArm = Constraint.create({
        bodyA: chest,
        pointA: {
            x: -24 * scale,
            y: -23 * scale
        },
        pointB: {
            x: 0,
            y: -8 * scale
        },
        bodyB: leftUpperArm,
        stiffness: 0.6,
        render: {
            visible: false
        }
    });
    const chestToLeftUpperLeg = Constraint.create({
        bodyA: chest,
        pointA: {
            x: -10 * scale,
            y: 30 * scale
        },
        pointB: {
            x: 0,
            y: -10 * scale
        },
        bodyB: leftUpperLeg,
        stiffness: 0.6,
        render: {
            visible: false
        }
    });
    const chestToRightUpperLeg = Constraint.create({
        bodyA: chest,
        pointA: {
            x: 10 * scale,
            y: 30 * scale
        },
        pointB: {
            x: 0,
            y: -10 * scale
        },
        bodyB: rightUpperLeg,
        stiffness: 0.6,
        render: {
            visible: false
        }
    });
    const upperToLowerRightArm = Constraint.create({
        bodyA: rightUpperArm,
        bodyB: rightLowerArm,
        pointA: {
            x: 0,
            y: 15 * scale
        },
        pointB: {
            x: 0,
            y: -25 * scale
        },
        stiffness: 0.6,
        render: {
            visible: false
        }
    });
    const upperToLowerLeftArm = Constraint.create({
        bodyA: leftUpperArm,
        bodyB: leftLowerArm,
        pointA: {
            x: 0,
            y: 15 * scale
        },
        pointB: {
            x: 0,
            y: -25 * scale
        },
        stiffness: 0.6,
        render: {
            visible: false
        }
    });
    const upperToLowerLeftLeg = Constraint.create({
        bodyA: leftUpperLeg,
        bodyB: leftLowerLeg,
        pointA: {
            x: 0,
            y: 20 * scale
        },
        pointB: {
            x: 0,
            y: -20 * scale
        },
        stiffness: 0.6,
        render: {
            visible: false
        }
    });
    const upperToLowerRightLeg = Constraint.create({
        bodyA: rightUpperLeg,
        bodyB: rightLowerLeg,
        pointA: {
            x: 0,
            y: 20 * scale
        },
        pointB: {
            x: 0,
            y: -20 * scale
        },
        stiffness: 0.6,
        render: {
            visible: false
        }
    });

    const headContraint = Constraint.create({
        bodyA: head,
        pointA: {
            x: 0,
            y: 25 * scale
        },
        pointB: {
            x: 0,
            y: -35 * scale
        },
        bodyB: chest,
        stiffness: 0.6,
        render: {
            visible: false
        }
    });

    return [
        [ handle ], // First is immediately added
        [ rightLowerArm, handleConstraint ],
        [ rightUpperArm, upperToLowerRightArm ],
        [ chest, chestToRightUpperArm ],
        [ rightUpperLeg, chestToRightUpperLeg ],
        [ leftUpperLeg, chestToLeftUpperLeg ],
        [ leftUpperArm, chestToLeftUpperArm ],
        [ head, headContraint ],
        [ leftLowerLeg, upperToLowerLeftLeg ],
        [ leftLowerArm, upperToLowerLeftArm ],
        [ rightLowerLeg, upperToLowerRightLeg ]
    ]
};
