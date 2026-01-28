#!/usr/bin/env bash
set -euo pipefail

# -----------------------------
# Config (override via env)
# -----------------------------
# KCFG를 지정하지 않으면 kubectl 기본 kubeconfig(~/.kube/config 또는 KUBECONFIG)을 사용
KCFG="${KCFG:-}"
KUBECTL=(kubectl)
if [[ -n "${KCFG}" ]]; then
  KUBECTL+=(--kubeconfig "${KCFG}")
fi

NS="${NS:-tools}"

# 기본은 로컬 전용 live overlay (gitignore 대상)
KDIR="${KDIR:-deploy/k8s/overlays/live}"

APP_LABEL="${APP_LABEL:-app=tools-hub}"
DEPLOY_NAME="${DEPLOY_NAME:-tools-hub}"

# Docker push hook
DOCKER_SCRIPT="${DOCKER_SCRIPT:-./scripts/docker.sh}"
AUTO_PUSH="${AUTO_PUSH:-1}" # 1이면 start/restart 실행 전 push, 0이면 비활성

usage() {
  # ANSI colors
  local BOLD="\033[1m"
  local DIM="\033[2m"
  local CYAN="\033[36m"
  local YELLOW="\033[33m"
  local RESET="\033[0m"

  printf "%b" "
${BOLD}사용법:${RESET}
  ${CYAN}./scripts/deploy.sh${RESET} <명령> [인자...]

${BOLD}명령:${RESET}
  ${CYAN}start${RESET}        (자동 push) kustomize 적용            ${DIM}(kubectl apply -k)${RESET}
  ${CYAN}stop${RESET}         kustomize 리소스 삭제                  ${DIM}(kubectl delete -k)${RESET}
  ${CYAN}restart${RESET}      (자동 push) Deployment 롤링 재시작
  ${CYAN}status${RESET}       Deploy/Pod/Svc/Ingress 상태
  ${CYAN}list${RESET}         status 별칭
  ${CYAN}pods${RESET}         앱 Pod 목록 조회 (wide)
  ${CYAN}describe${RESET}     Deployment 상세 / 이벤트 / 오류 원인
  ${CYAN}log${RESET} [deploy|pod] 로그 출력 (기본: deploy)
  ${CYAN}exec${RESET} <pod> [sh] Pod 접속 (기본 shell: sh)
  ${CYAN}port${RESET} a:b     포트 포워딩 ${DIM}(예: 3000:3000)${RESET}

${BOLD}환경 변수:${RESET}
  ${YELLOW}KCFG${RESET}=/path/to/kubeconfig      ${DIM}kubeconfig 경로(미지정 시 kubectl 기본값)${RESET}
  ${YELLOW}NS${RESET}=tools                      ${DIM}네임스페이스${RESET}
  ${YELLOW}KDIR${RESET}=deploy/k8s/overlays/live ${DIM}kustomize 디렉토리${RESET}
  ${YELLOW}APP_LABEL${RESET}=app=tools-hub       ${DIM}Pod 라벨 셀렉터${RESET}
  ${YELLOW}DEPLOY_NAME${RESET}=tools-hub         ${DIM}Deployment 이름${RESET}
  ${YELLOW}AUTO_PUSH${RESET}=1|0                 ${DIM}자동 docker push (기본 1)${RESET}
  ${YELLOW}DOCKER_SCRIPT${RESET}=./scripts/docker.sh ${DIM}docker push 스크립트${RESET}

${BOLD}예시:${RESET}
  ${CYAN}./scripts/deploy.sh start${RESET}
  ${YELLOW}AUTO_PUSH=0${RESET} ${CYAN}./scripts/deploy.sh start${RESET}
  ${YELLOW}KDIR=deploy/k8s/base${RESET} ${CYAN}./scripts/deploy.sh start${RESET}
  ${YELLOW}KCFG=/path/to/kubeconfig${RESET} ${CYAN}./scripts/deploy.sh status${RESET}
"
}

pick_pod() {
  "${KUBECTL[@]}" -n "${NS}" get pods -l "${APP_LABEL}" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true
}

run_docker_push() {
  if [[ "${AUTO_PUSH}" != "1" ]]; then
    echo "[kh] AUTO_PUSH=0 (docker push 생략)"
    return 0
  fi

  if [[ ! -f "${DOCKER_SCRIPT}" ]]; then
    echo "[kh] docker script not found: ${DOCKER_SCRIPT}"
    echo "[kh] (docker push 생략)"
    return 0
  fi

  if [[ ! -x "${DOCKER_SCRIPT}" ]]; then
    chmod +x "${DOCKER_SCRIPT}" || true
  fi

  echo "[kh] docker push: ${DOCKER_SCRIPT} push"
  "${DOCKER_SCRIPT}" push
}

cmd="${1:-}"
shift || true

case "${cmd}" in
  ""|"-h"|"--help"|"help")
    usage
    ;;

  start)
    run_docker_push
    echo "[kh] apply -k ${KDIR} (ns=${NS}${KCFG:+, kubeconfig=${KCFG}})"
    "${KUBECTL[@]}" apply -k "${KDIR}"

    echo "[kh] rollout restart deployment/${DEPLOY_NAME} (ns=${NS})"
    "${KUBECTL[@]}" -n "${NS}" rollout restart "deployment/${DEPLOY_NAME}"

    echo "[kh] rollout status deployment/${DEPLOY_NAME}"
    "${KUBECTL[@]}" -n "${NS}" rollout status "deployment/${DEPLOY_NAME}" --timeout=180s
    ;;

  stop)
    echo "[kh] delete -k ${KDIR} (ns=${NS}${KCFG:+, kubeconfig=${KCFG}})"
    "${KUBECTL[@]}" delete -k "${KDIR}" --ignore-not-found
    ;;

  restart)
    run_docker_push
    echo "[kh] rollout restart deployment/${DEPLOY_NAME} (ns=${NS})"
    "${KUBECTL[@]}" -n "${NS}" rollout restart "deployment/${DEPLOY_NAME}"
    echo "[kh] rollout status deployment/${DEPLOY_NAME}"
    "${KUBECTL[@]}" -n "${NS}" rollout status "deployment/${DEPLOY_NAME}" --timeout=180s
    ;;

  status|list)
    echo "[kh] namespace: ${NS}"
    "${KUBECTL[@]}" -n "${NS}" get deploy -o wide || true
    echo
    "${KUBECTL[@]}" -n "${NS}" get pods -o wide || true
    echo
    "${KUBECTL[@]}" -n "${NS}" get svc -o wide || true
    echo
    "${KUBECTL[@]}" -n "${NS}" get ingress -o wide 2>/dev/null || true
    ;;

  pods)
    "${KUBECTL[@]}" -n "${NS}" get pods -l "${APP_LABEL}" -o wide
    ;;

  describe)
    "${KUBECTL[@]}" -n "${NS}" describe "deployment/${DEPLOY_NAME}"
    ;;

  log|logs)
    target="${1:-deploy}"
    shift || true

    if [[ "${target}" == "pod" ]]; then
      pod="$(pick_pod)"
      if [[ -z "${pod}" ]]; then
        echo "[kh] no pod found for label: ${APP_LABEL} (ns=${NS})" >&2
        exit 1
      fi
      echo "[kh] logs -f pod/${pod}"
      "${KUBECTL[@]}" -n "${NS}" logs -f "pod/${pod}" --tail=200 \
        | sed "s/^/[${pod}] /"
    else
      echo "[kh] logs -f pods (label=${APP_LABEL})"
      # 각 pod 로그를 동시에 follow 하고, 라인마다 pod 이름(prefix)을 붙임
      "${KUBECTL[@]}" -n "${NS}" get pods -l "${APP_LABEL}" -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}{end}' \
        | while IFS= read -r pod; do
            [[ -z "${pod}" ]] && continue
            (
              "${KUBECTL[@]}" -n "${NS}" logs -f "pod/${pod}" --tail=200 \
                | sed "s/^/[${pod}] /"
            ) &
          done
      wait
    fi
    ;;

  exec)
    pod="${1:-}"
    shift || true
    if [[ -z "${pod}" ]]; then
      pod="$(pick_pod)"
      if [[ -z "${pod}" ]]; then
        echo "[kh] usage: kh exec <pod> [sh]" >&2
        echo "[kh] no pod found for label: ${APP_LABEL} (ns=${NS})" >&2
        exit 1
      fi
    fi
    shell="${1:-sh}"
    echo "[kh] exec -it ${pod} -- ${shell}"
    "${KUBECTL[@]}" -n "${NS}" exec -it "${pod}" -- "${shell}"
    ;;

  port)
    map="${1:-}"
    if [[ -z "${map}" ]]; then
      echo "[kh] usage: kh port 3000:3000" >&2
      exit 1
    fi
    echo "[kh] port-forward deploy/${DEPLOY_NAME} ${map}"
    "${KUBECTL[@]}" -n "${NS}" port-forward "deployment/${DEPLOY_NAME}" "${map}"
    ;;

  *)
    echo "[kh] unknown command: ${cmd}" >&2
    usage
    exit 1
    ;;
esac
