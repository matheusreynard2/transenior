import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCorridaEmAndamento } from "../contexts/CorridaEmAndamentoContext.jsx";
import MapaRotaComponent from "./MapaRotaComponent.jsx";

const LARGURA = 420;
const ALTURA_EXPANDIDA = 420;
const ALTURA_MINIMIZADA = 48;
const MARGEM = 24;

function JanelaCorridaEmAndamento() {
    const { activeCorrida, showJanelaFlutuante, closeCorridaModal } = useCorridaEmAndamento();
    const navigate = useNavigate();
    const [isMinimized, setMinimized] = useState(false);
    const [position, setPosition] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0, left: 0, top: 0 });
    const boxRef = useRef(null);
    const jaAbertaRef = useRef(false);

    const corridaModal = activeCorrida;

    // Posição inicial só ao abrir a janela (evita resetar ao arrastar quando o context re-renderiza)
    useEffect(() => {
        if (!showJanelaFlutuante || !corridaModal) {
            setPosition(null);
            jaAbertaRef.current = false;
            return;
        }
        if (!jaAbertaRef.current) {
            jaAbertaRef.current = true;
            setPosition({
                left: window.innerWidth - LARGURA - MARGEM,
                top: window.innerHeight - ALTURA_EXPANDIDA - MARGEM,
            });
        }
    }, [showJanelaFlutuante, corridaModal]);

    const handleFinalizar = useCallback(() => {
        if (corridaModal?.onFinalizar) corridaModal.onFinalizar();
        closeCorridaModal();
    }, [corridaModal, closeCorridaModal]);

    const handleMouseDown = useCallback((e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        const rect = boxRef.current?.getBoundingClientRect();
        if (!rect) return;
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            left: position?.left ?? rect.left,
            top: position?.top ?? rect.top,
        };
        setIsDragging(true);
    }, [position]);

    useEffect(() => {
        if (!isDragging) return;
        const onMove = (e) => {
            const dx = e.clientX - dragStartRef.current.x;
            const dy = e.clientY - dragStartRef.current.y;
            setPosition({
                left: dragStartRef.current.left + dx,
                top: dragStartRef.current.top + dy,
            });
        };
        const onUp = () => setIsDragging(false);
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
        return () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        };
    }, [isDragging]);

    const abrirTelaCheia = () => {
        if (!corridaModal) return;
        closeCorridaModal();
        navigate("/rotaCorrida", {
            state: {
                corridaId: corridaModal.corridaId,
                enderecoOrigem: corridaModal.enderecoOrigem,
                enderecoDestino: corridaModal.enderecoDestino,
            },
        });
    };

    if (!showJanelaFlutuante || !corridaModal) return null;

    const altura = isMinimized ? ALTURA_MINIMIZADA : ALTURA_EXPANDIDA;
    const style = {
        position: "fixed",
        width: isMinimized ? 320 : LARGURA,
        height: altura,
        zIndex: 9999,
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        borderRadius: "12px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        border: "1px solid #dee2e6",
        ...(position
            ? { left: position.left, top: position.top }
            : { right: MARGEM, bottom: MARGEM }),
    };

    return (
        <div ref={boxRef} style={style} className="janela-corrida-flutuante">
            <div
                role="button"
                tabIndex={0}
                onMouseDown={handleMouseDown}
                className="d-flex align-items-center justify-content-between px-3 py-2 bg-primary text-white user-select-none"
                style={{
                    cursor: isDragging ? "grabbing" : "grab",
                    minHeight: "40px",
                    flexShrink: 0,
                }}
                title="Arraste para mover"
            >
                <span className="fw-semibold small">
                    {isMinimized ? "Corrida em andamento" : "Corrida em andamento"}
                </span>
                <div className="d-flex align-items-center gap-1" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        className="btn btn-sm btn-light text-dark"
                        title="Abrir em tela cheia"
                        onClick={abrirTelaCheia}
                    >
                        ⛶
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-light text-dark"
                        title={isMinimized ? "Expandir" : "Minimizar"}
                        onClick={() => setMinimized((m) => !m)}
                    >
                        {isMinimized ? "□" : "−"}
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-light text-dark"
                        title="Fechar (a corrida continua em andamento)"
                        onClick={closeCorridaModal}
                    >
                        ✕
                    </button>
                </div>
            </div>
            {!isMinimized && (
                <div
                    className="flex-grow-1 d-flex flex-column p-0"
                    style={{
                        minHeight: 0,
                        overflowY: "auto",
                        overflowX: "hidden",
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                    <MapaRotaComponent
                        initialEnderecoOrigem={corridaModal.enderecoOrigem}
                        initialEnderecoDestino={corridaModal.enderecoDestino}
                        corridaId={corridaModal.corridaId}
                        embedInModal={true}
                        onFinalizar={handleFinalizar}
                    />
                </div>
            )}
        </div>
    );
}

export default JanelaCorridaEmAndamento;
