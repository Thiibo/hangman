import {
    Bodies,
    Composite,
    Engine,
    Runner,
    Render,
    Vector,
    Body,
    Constraint,
    Events
} from "matter-js";

export function createSimulation() {
    const parentElement =  document.querySelector('#ragdoll') as HTMLElement;
    if (parentElement.querySelector('canvas')) return; // prevent spawning multiple canvasses

    const engine = Engine.create();
    const world = engine.world;
    const render = Render.create({
        element: parentElement,
        engine: engine,
        options: {
            width: parentElement.clientWidth,
            height: parentElement.clientHeight,
            showAngleIndicator: true
        }
    });

    Render.run(render);

    const runner = Runner.create();
    Runner.run(runner, engine);

    const ragdollSize = 1.3;
    const ragdollObjects = createRagdollObjects(0, 0, ragdollSize);
    const ragdoll = Composite.create({ bodies: ragdollObjects[0] as Body[] });
    let ragdollStage = 1;
    Composite.add(world, ragdoll);

    const pointer = Vector.create();
    document.addEventListener('mousemove', e => {
        pointer.x = e.clientX / ragdollSize - 150;
        pointer.y = e.clientY / ragdollSize - 50;
    });

    Events.on(engine, 'afterUpdate', function(event) {
        const handle = ragdoll.bodies.find(body => body.label === "handle")!;
        Body.applyForce(handle, handle.position, Vector.mult(Vector.sub(pointer, handle.position), 0.001))
    });

    // Fit the render viewport to the scene
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: 800, y: 600 }
    });

    return () => {
        Composite.add(ragdoll, ragdollObjects[ragdollStage]);
        console.log("next stage!");
        
        ragdollStage++;
    }
};

function createRagdollObjects(x: number, y: number, scale: number = 1): (Body | Composite | Constraint)[][] {
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
    const defaultLimbOptions = {
        collisionFilter: {
            group: Body.nextGroup(true)
        },
        chamfer: {
            radius: 10 * scale
        },
        render: {
            fillStyle: '#FFBC42'
        }
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
            }
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
