import React, { useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styled from "@emotion/styled";
import { colourOptions, colourStyles } from "../../components/Select";
import Select from "react-select";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadString,
} from "firebase/storage";
import { authService, storageService } from "../../firebase/firebase";
import { useRecoilValue } from "recoil";
import { hospitalData } from "../../share/atom";
import { FiEdit3 } from "react-icons/fi";
import CustomModal, { ModalButton } from "../../components/custom/CustomModal";

const Container = styled.div``;
const FormWrap = styled.form`
  /* display: flex;
  flex-direction: column;
  justify-content: center; */
  align-items: center;
  padding: 100px;
  /* background-color: red; */
`;

const ImageBox = styled.label`
  display: flex;
  justify-content: center;
  /* align-items: center; */
  /* border-radius: 100%; */
  overflow: hidden;
  cursor: pointer;
  width: 100%;
  height: 400px;
  margin: auto;
  > img {
    width: 100%;
    height: 100%;
    text-align: center;
    object-fit: fill;
  }
`;

const PostImage = styled.img`
  border: 1px solid lightgray;
  /* border-radius: 100%; */
  object-fit: fill;
`;

const InputWrap = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 30px;
  margin-bottom: 30px;
`;

const TitleBox = styled.textarea`
  margin: 10px 0;
  padding: 8px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid gray;
  resize: none;
  margin-bottom: 30px;
`;

const ContentBox = styled.textarea`
  margin: 10px 0;
  padding: 8px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid gray;
  resize: none;
  margin-bottom: 30px;
`;

const TotalCostBox = styled.textarea`
  margin: 10px 0;
  padding: 8px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid gray;
  resize: none;
  textarea::placeholder {
    color: black;
    opacity: 1;
  }
`;

const CreatePostButton = styled.button`
  margin: 10px 0;
  padding: 8px;
  font-size: 16px;
  border-radius: 5px;
  border: none;
  background-color: #15b5bf;
  cursor: pointer;
  float: right;
`;
const StarRating = styled.div`
  display: flex;
  flex-direction: row;
  cursor: pointer;
  margin-bottom: 30px;
`;

const PostSelect = styled.div`
  margin-bottom: 30px;
`;

const NewPost = () => {
  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [starRating, setStarRating] = useState(0);
  const [selectvalue, setSelectValue] = useState([]);
  const [openModalTitle, setOpenModalTitle] = useState(false);
  const [openModalContents, setOpenModalContents] = useState(false);
  const [openModalTotalCost, setOpenModalTotalCost] = useState(false);
  const [openModalStarRating, setOpenModalStarRating] = useState(false);
  const [openModalSelectValue, setOpenModalSelectValue] = useState(false);
  const [openModalPhoto, setOpenModalPhoto] = useState(false);

  const focusTitle = useRef();
  const focusContents = useRef();
  const focusTotalCost = useRef();

  const router = useRouter();

  const placesData = useRecoilValue(hospitalData);

  // ?????? ?????????
  const starArray = Array.from({ length: 5 }, (_, i) => i + 1);

  const Star = ({ selected, onClick }) => (
    <div
      style={{
        color: selected ? "#15B5BF" : "#e4e5e9",
      }}
      onClick={onClick}
    >
      <span style={{ fontSize: "40px" }}>&#9733;</span>
    </div>
  );

  const createdAt = Date.now();
  const timestamp = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(createdAt);

  // DB??? ??????
  const handleSubmit = async (downloadUrl) => {
    if (title.replace(/ /g, "") === "") {
      setOpenModalTitle(true);

      return;
    } else if (contents.replace(/ /g, "") === "") {
      setOpenModalContents(true);
      return;
    } else if (totalCost.replace(/ /g, "") === "" || !/^\d+$/.test(totalCost)) {
      setOpenModalTotalCost(true);
      return;
    } else if (starRating.length === 0) {
      setOpenModalStarRating(true);
      return;
    } else if (selectvalue.length === 0) {
      setOpenModalSelectValue(true);
      return;
    }

    try {
      const response = await axios.post(
        "https://humble-summer-ballcap.glitch.me/posts",
        {
          title,
          contents,
          totalCost,
          rating: starRating,
          selectedColors: selectvalue.map((option) => option.value), // ????????? value??????
          downloadUrl,
          date: timestamp,
          displayName: authService.currentUser?.displayName,
          userId: authService.currentUser?.uid,
          profileImage: authService.currentUser?.photoURL,
          hospitalId: placesData.id,
          isEdit: false,
          id: createdAt,
          hospitalAddress: placesData.address_name,
          hospitalName: placesData.place_name,
        },
      );
      localStorage.removeItem("Photo");
      router.push({
        pathname: "/searchMap",
        query: { target: placesData.place_name },
      });
    } catch (error) {
      console.error(error);
    }
  };

  // ????????? ?????????(???????????? ????????? ?????? ??????)
  const uploadPhoto = async (event) => {
    // event.preventDefault();
    try {
      const theFile = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(theFile); // file ????????? ??????????????? ?????? ??? ?????? data URL??? ??????.

      reader.onloadend = (finishedEvent) => {
        // ??????????????? ??????????????? data URL??? ?????? ????????? ????????? ???
        const contentimgDataUrl = finishedEvent.currentTarget.result;
        localStorage.setItem("Photo", contentimgDataUrl);
        document.getElementById("preview-photo").src = contentimgDataUrl; //useref ???????????? DOM??? ?????? ?????? ?????? ??????
      };
    } catch (error) {
      console.error(error);
    }
  };

  const ChangePhoto = async (event) => {
    event.preventDefault();
    // ????????? ???????????? ????????? ????????? url??? ?????? ??????????????? ?????? ????????? ?????????
    // ??? ??? ???????????? firestore??? ?????????
    try {
      let newPhoto = localStorage.getItem("Photo");
      const imgRef = ref(storageService, `${Date.now()}`);

      let downloadUrl;
      if (newPhoto) {
        const response = await uploadString(imgRef, newPhoto, "data_url");
        downloadUrl = await getDownloadURL(response.ref);
      }
      if (downloadUrl) {
        handleSubmit(downloadUrl);
      } else if (downloadUrl === undefined) {
        // ????????? ????????? ????????? ??????
        setOpenModalPhoto(true);
        return;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const ModalTitleEmpty = () => {
    setOpenModalTitle(false);
    focusTitle.current.focus();
  };

  const ModalContentsEmpty = () => {
    setOpenModalContents(false);
    focusContents.current.focus();
  };

  const ModalTotalCostEmpty = () => {
    setOpenModalTotalCost(false);
    focusTotalCost.current.focus();
  };

  const ModalStarRatingEmpty = () => {
    setOpenModalStarRating(false);
  };

  const ModalSelectValueEmpty = () => {
    setOpenModalSelectValue(false);
  };

  const ModalPhotoEmpty = () => {
    setOpenModalPhoto(false);
  };

  return (
    <>
      {openModalTitle && (
        <CustomModal modalText1={"????????? ??????????????????"}>
          <ModalButton onClick={ModalTitleEmpty}>??????</ModalButton>
        </CustomModal>
      )}
      {openModalContents && (
        <CustomModal modalText1={"????????? ??????????????????"}>
          <ModalButton onClick={ModalContentsEmpty}>??????</ModalButton>
        </CustomModal>
      )}
      {openModalTotalCost && (
        <CustomModal modalText1={"????????? ????????? ??????????????????"}>
          <ModalButton onClick={ModalTotalCostEmpty}>??????</ModalButton>
        </CustomModal>
      )}
      {openModalStarRating && (
        <CustomModal modalText1={"??????????????? ??????????????????"}>
          <ModalButton onClick={ModalStarRatingEmpty}>??????</ModalButton>
        </CustomModal>
      )}
      {openModalSelectValue && (
        <CustomModal modalText1={"??????????????? ??????????????????"}>
          <ModalButton onClick={ModalSelectValueEmpty}>??????</ModalButton>
        </CustomModal>
      )}
      {openModalPhoto && (
        <CustomModal modalText1={"????????? ?????????????????????"}>
          <ModalButton onClick={ModalPhotoEmpty}>??????</ModalButton>
        </CustomModal>
      )}
      <Container>
        <FormWrap onSubmit={ChangePhoto}>
          <label style={{ fontSize: "20px", fontWeight: "bold" }}>
            ????????????
          </label>
          <p style={{ color: "lightgray" }}>
            ?????????, ?????? ??? ?????? ?????????????????? ?????? ??? ?????? ????????????
            ??????????????????.
          </p>
          <ImageBox htmlFor="file">
            <PostImage
              id="preview-photo"
              src="https://images.unsplash.com/photo-1648823161626-0e839927401b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
              alt="???????????????"
            />
          </ImageBox>
          <input
            id="file"
            type="file"
            style={{ display: "none", border: "none" }}
            accept="images/*"
            onChange={uploadPhoto}
          />
          <InputWrap>
            <label
              htmlFor="title"
              style={{ fontSize: "20px", fontWeight: "bold" }}
            >
              ?????? ??????
            </label>
            <p style={{ color: "lightgray" }}>
              ?????? ?????? ???????????? ?????? ?????????????????? ????????? ?????????.
            </p>
            <TitleBox
              type="text"
              ref={focusTitle}
              placeholder="????????? ????????? ?????????."
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              id="title"
              rows="1"
              maxLength="50"
              style={{
                border: "none",
                backgroundColor: "#e8e7e6",
                opacity: "0.6",
              }}
            />
            <label
              htmlFor="title"
              style={{ fontSize: "20px", fontWeight: "bold" }}
            >
              ?????? ??????
            </label>
            <p style={{ color: "lightgray" }}>
              ????????? ????????? ?????????????????? ????????? ?????????.
            </p>
            <ContentBox
              type="text"
              ref={focusContents}
              placeholder="????????? ????????? ?????????."
              value={contents}
              onChange={(event) => setContents(event.target.value)}
              rows="8"
              maxLength="500"
              style={{
                border: "none",
                backgroundColor: "#e8e7e6",
                opacity: "0.6",
              }}
            />
            <label
              htmlFor="title"
              style={{ fontSize: "20px", fontWeight: "bold" }}
            >
              ?????? ??????
            </label>
            <p style={{ color: "lightgray" }}>
              ?????? ????????? ????????? ????????? ?????????.
            </p>
            <TotalCostBox
              type="text"
              ref={focusTotalCost}
              placeholder="????????? ????????? ?????????"
              value={totalCost}
              onChange={(event) => setTotalCost(event.target.value)}
              rows="1"
              maxLength="7"
              style={{
                border: "none",
                backgroundColor: "#e8e7e6",
                opacity: "0.6",
              }}
            />
          </InputWrap>
          {/* <CreatePostButton type="submit">Create Post</CreatePostButton> */}
          <label
            htmlFor="title"
            style={{ fontSize: "20px", fontWeight: "bold" }}
          >
            ?????? ??????
          </label>
          <p style={{ color: "lightgray" }}>
            ??? ????????? ???????????? ????????? ?????????.
          </p>
          <StarRating>
            {starArray.map((star) => (
              <Star
                key={star}
                selected={star <= starRating}
                onClick={() => setStarRating(star)}
              />
            ))}
          </StarRating>
          <label
            htmlFor="title"
            style={{ fontSize: "20px", fontWeight: "bold" }}
          >
            ????????????
          </label>
          <p style={{ color: "lightgray" }}>
            ?????? ??????????????? ??? ????????? ???????????? ????????? ?????????.
          </p>
          <PostSelect>
            <Select
              value={selectvalue}
              onChange={(selectedOptions) => setSelectValue(selectedOptions)}
              closeMenuOnSelect={false}
              defaultValue={[colourOptions[0], colourOptions[1]]}
              isMulti
              options={colourOptions}
              styles={colourStyles}
              instanceId="selectbox"
            />
          </PostSelect>
          <CreatePostButton>
            <FiEdit3 />
            ?????? ????????????
          </CreatePostButton>
        </FormWrap>
      </Container>
    </>
  );
};

export default NewPost;
